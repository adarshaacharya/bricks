import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { EnvironmentVariables } from 'src/common/config/configuration';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DmsService {
  private client: S3Client;
  private bucketName = this.configService.get('S3_BUCKET_NAME');

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly logger: PinoLogger,
  ) {
    const s3_region = this.configService.get('S3_REGION');

    if (!s3_region) {
      this.logger.warn('S3_REGION not found in environment variables');
      throw new Error('S3_REGION not found in environment variables');
    }

    this.client = new S3Client({
      region: this.configService.get('S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
    });

    logger.setContext(DmsService.name);
  }

  /**
   *
   * @param file - The file to be uploaded
   * @returns  A promise that resolves to an object containing the URL and resource type of the
   *   uploaded file.
   */
  async uploadSinglePublicFile(file: Express.Multer.File) {
    try {
      const key = `${uuidv4()}`;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
        Metadata: {
          originalName: file.originalname,
        },
      });

      const uploadResult = await this.client.send(command);

      this.logger.debug(
        `File uploaded to S3: ${file.originalname} - ${uploadResult.ETag}`,
      );

      return {
        url: (await this.getFileUrl(key)).url,
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getFileUrl(key: string) {
    return { url: `https://${this.bucketName}.s3.amazonaws.com/${key}` };
  }

  async deleteFile(key: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const deleteResult = await this.client.send(command);

      this.logger.info(`File deleted from S3: ${key}`);

      return deleteResult;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * @description Get a signed URL for a file in S3, its not being used in the project, just added for reference
   */
  async getSignedUrl(key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, {
        expiresIn: 60 * 60 * 24,
      });

      return { url };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async uploadMultiplePublicFiles(files: Express.Multer.File[]) {
    try {
      const uploadPromises = files.map(async (file) => {
        const key = `${uuidv4()}`;

        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        });

        const uploadResult = await this.client.send(command);

        this.logger.debug(
          `File uploaded to S3: ${file.originalname} - ${uploadResult.ETag}`,
        );

        return {
          url: (await this.getFileUrl(key)).url,
        };
      });

      return Promise.all(uploadPromises);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
