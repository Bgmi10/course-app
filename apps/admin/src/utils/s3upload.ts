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
    Bucket: import.meta.env.VITE_APP_AWS_NAME,
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

