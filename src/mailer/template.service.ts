import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import mjml from 'mjml';
import { PinoLogger } from 'nestjs-pino';
import path from 'path';
import * as Handlebars from 'handlebars';
import {
  BuiltTemplate,
  EmailMetadata,
  EmailTemplate,
  TemplateTypeEnum,
} from './template.interface';

@Injectable()
export class TemplateService {
  constructor(private readonly logger: PinoLogger) {
    logger.setContext(TemplateService.name);
  }

  async getTemplate<T>({
    name,
    data,
  }: EmailTemplate<T>): Promise<BuiltTemplate> {
    try {
      // pass the template name to produce html template
      const result = await this.getEmailTemplate(name);

      // compile handlebars template
      const template = Handlebars.compile<typeof data>(result.html);

      // build final output with data passed i.e eg : firstname, lastname, etc
      const html = template(data);

      // extract extra info (eg. subject) from the template
      const metadata = await this.getEmailData(name);

      return { html, metadata };
    } catch (error) {
      this.logger.error(`Error reading email template: ${error}`);
      throw new Error(error);
    }
  }

  async getEmailTemplate(
    templateName: TemplateTypeEnum,
  ): Promise<ReturnType<typeof mjml>> {
    try {
      const file = await readFile(
        path.resolve(__dirname, './templates', `${templateName}.mjml`),
        'utf8',
      );

      return mjml(file);
    } catch (error) {
      this.logger.error(`Error reading email template: ${error}`);
      throw new Error(error);
    }
  }

  async getEmailData(templateName: string): Promise<EmailMetadata> {
    try {
      const contents = await readFile(
        path.resolve(__dirname, './templates', `${templateName}.json`),
        'utf8',
      );
      return JSON.parse(contents);
    } catch (error) {
      this.logger.error(`Error reading email template: ${error}`);
      throw new Error(error);
    }
  }
}
