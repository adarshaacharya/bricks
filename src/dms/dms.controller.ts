import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { DmsService } from './dms.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { MAX_FILE_SIZE } from './dms.constants';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('dms')
@Controller('dms')
export class DmsController {
  constructor(private readonly dmsService: DmsService) {}

  @UseGuards(AccessTokenGuard)
  @Post('/file')
  @ApiOperation({
    summary: 'Upload file',
    description: 'Upload file to S3 bucket',
  })
  @ApiBody({
    description: 'Upload a file',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        isPublic: {
          type: 'boolean',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({
            maxSize: MAX_FILE_SIZE, // 10MB
            message: 'File is too large. Max file size is 10MB',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body('isPublic') isPublic: string,
  ) {
    const isPublicBool = isPublic === 'true' ? true : false;
    return this.dmsService.uploadSingleFile({ file, isPublic: isPublicBool });
  }

  @UseGuards(AccessTokenGuard)
  @Post('/files')
  @ApiOperation({
    summary: 'Upload files',
    description: 'Upload multiple files to S3 bucket',
  })
  @ApiBody({
    description: 'Upload multiple files',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({
            maxSize: MAX_FILE_SIZE, // 10MB
            message: 'File is too large. Max file size is 10MB',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.dmsService.uploadMultiplePublicFiles(files);
  }

  @Get(':key')
  @ApiOperation({
    summary: 'Get file',
    description: 'Get file from S3 bucket',
  })
  async getFile(@Param('key') key: string) {
    return this.dmsService.getFileUrl(key);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Post('/:key')
  @ApiOperation({
    summary: 'Delete file',
    description: 'Delete file from S3 bucket',
  })
  async deleteFile(@Param('key') key: string) {
    return this.dmsService.deleteFile(key);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get signed URL',
    description: 'Get a signed URL for a file in S3',
  })
  @UseGuards(AccessTokenGuard)
  @Get('/signed-url/:key')
  async getSingedUrl(@Param('key') key: string) {
    return this.dmsService.getPresignedSignedUrl(key);
  }
}
