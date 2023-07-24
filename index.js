'use strict';
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event, context) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  const size = event.Records[0].s3.object.size;

  let imagesData;
  try {
    const response = await s3.getObject({ Bucket: bucket, Key: 'images.json' }).promise();
    imagesData = JSON.parse(response.Body.toString());
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      imagesData = [];
    } else {
      throw error;
    }
  }

  let imageExists = false;
  for (const image of imagesData) {
    if (image.name === key) {
      image.size = size;
      imageExists = true;
      break;
    }
  }

  if (!imageExists) {
    const imageData = {
      name: key,
      size: size,
    };
    imagesData.push(imageData);
  }

  await s3
    .putObject({
      Bucket: bucket,
      Key: 'images.json',
      Body: JSON.stringify(imagesData),
      ContentType: 'application/json',
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify('Image processed successfully.'),
  };
};
