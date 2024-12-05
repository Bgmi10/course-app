import AWS from 'aws-sdk';
import {ListObjectsV2Command, S3Client} from '@aws-sdk/client-s3';

AWS.config.update({
  region: 'eu-north-1',
  accessKeyId: import.meta.env.VITE_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_APP_AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

const S3 = new S3Client({
    region: 'eu-north-1',
    credentials : {
    accessKeyId: import.meta.env.VITE_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_APP_AWS_SECRET_ACCESS_KEY
  }

})

export const uploadToS3 = async (file: File, folderName: string): Promise<string> => {
  const fileName = `${folderName}/${Date.now()}-${file.name}`;
  const params: AWS.S3.PutObjectRequest = {
    Bucket: import.meta.env.VITE_APP_AWS_BUCKET_NAME,
    Key: fileName,
    Body: file,
    ContentType: file.type,
  };

  try {
    const { Location } = await s3.upload(params).promise();
    return Location;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('File upload failed');
  }
};

export const deleteFromS3 = async (fileUrl: string): Promise<void> => {
  if(fileUrl === '') return;
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


export const FetchFoldersFromS3 = async (bucketName: string, prefix: string = ''): Promise<string[]> => {
  try {
    const params = {
      Bucket: bucketName,
      Prefix: prefix,     
      Delimiter: '/'        
    };
    
    const command = new ListObjectsV2Command(params);
    const data = await S3.send(command);
    const folders = data?.CommonPrefixes?.map((item) => item.Prefix) || [];

    for(const folder of folders){
      const nested_folders = await FetchFoldersFromS3(bucketName, folder);
      folders.push(...nested_folders);
    }
    return folders;
  } catch (e) {
    console.error('Error fetching folders from S3:', e);
    throw new Error('Failed to fetch folders from S3');
  }
};
