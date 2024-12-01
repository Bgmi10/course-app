import AWS from 'aws-sdk';

AWS.config.update({
  region: 'eu-north-1',
  accessKeyId: import.meta.env.VITE_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_APP_AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

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
  const key = fileUrl.split('/').slice(3).join('/');
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
