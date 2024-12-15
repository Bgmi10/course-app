import AWS from 'aws-sdk';
import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { region_aws } from './constants';


AWS.config.update({
  region: region_aws,
  accessKeyId: import.meta.env.VITE_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_APP_AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

const S3 = new S3Client({
  region: region_aws,
  credentials: {
    accessKeyId: import.meta.env.VITE_APP_AWS_ACCESS_KEY_ID as string,
    secretAccessKey: import.meta.env.VITE_APP_AWS_SECRET_ACCESS_KEY as string,
  },
});
 
export const uploadToS3 = async (
  file: File,
  folderName: string,
  onProgress: (percentage: number) => void
): Promise<string> => {
  const fileName = `${Date.now()}_${file.name}`;

  var lastChar = folderName.substr(folderName.length - 1);
  const key = (lastChar == '/') ? `${folderName}${fileName}` : `${folderName}/${fileName}`;
  const params: AWS.S3.PutObjectRequest = {
    Bucket: import.meta.env.VITE_APP_AWS_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: file.type,
  };

  try {
    const managedUpload = s3.upload(params);
    managedUpload.on('httpUploadProgress', (progress) => {
      const percentage = Math.round((progress.loaded / (progress.total || 1)) * 100);
      onProgress(percentage);
    });

    const location = await managedUpload.promise();
    return location.Location;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('File upload failed');
  }
};

export const deleteFromS3 = async (fileUrl: string): Promise<void> => {
  if (fileUrl === '') return;
  const decodedUrl = decodeURIComponent(fileUrl);
  const key = decodedUrl.split('/').slice(3).join('/');
  const params: AWS.S3.DeleteObjectRequest = {
    Bucket: import.meta.env.VITE_APP_AWS_BUCKET_NAME,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('File deletion failed');
  }
};

export const FetchFoldersFromS3 = async (
  bucketName: string,
  prefix: string = '',
  delimiter: string = '/'
): Promise<{ folders: string[]; files: string[] }> => {
  try {
    const params = {
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: delimiter,
    };

    const command = new ListObjectsV2Command(params);
    const data = await S3.send(command);

    const folders = (data?.CommonPrefixes?.map((item) => item.Prefix) || []).filter(
      (prefix): prefix is string => !!prefix
    );

    const files = (data?.Contents?.map((i) => i.Key || '') || []).filter(
      (key): key is string => !!key
    );

    for (const folder of folders.slice()) {
      const nested = await FetchFoldersFromS3(bucketName, folder);
      folders.push(...nested.folders);
    }

    return { folders, files };
  } catch (e) {
    console.error('Error fetching folders from S3:', e);
    throw new Error('Failed to fetch folders from S3');
  }
};

export const deleteFolderFromS3 = async (folderName: string) => {
  if (folderName === '') return;
  const decodeUrl = decodeURIComponent(folderName);
  const params = {
    Bucket: import.meta.env.VITE_APP_AWS_BUCKET_NAME,
    Prefix: decodeUrl,
  };

  try {
    const listedObjects = await S3.send(new ListObjectsV2Command(params));

    if (listedObjects.Contents && listedObjects.Contents.length > 0) {
      const deleteParams = {
        Bucket: import.meta.env.VITE_APP_AWS_BUCKET_NAME,
        Delete: {
          Objects: listedObjects.Contents.map((item) => ({ Key: item.Key })),
          Quiet: true,
        },
      };

      await S3.send(new DeleteObjectsCommand(deleteParams));
    }
  } catch (error) {
    console.error('Error deleting folder objects from S3:', error);
    throw new Error('Folder deletion failed');
  }
};
