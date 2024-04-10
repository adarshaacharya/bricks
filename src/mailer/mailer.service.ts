import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/common/config/configuration';
import sgMail from '@sendgrid/mail';
import * as sg from '@sendgrid/mail';
import { PinoLogger } from 'nestjs-pino';
import { EmailTemplate } from './template.interface';
import { Email, EmailData } from './mailer.interface';
import { TemplateService } from './template.service';

@Injectable()
export class MailerService {
  private emailSender: string;
  private enabled = true;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly logger: PinoLogger,
    private readonly templateService: TemplateService,
  ) {
    logger.setContext(MailerService.name);

    const apiKey = this.configService.get('SENDGRID_API_KEY');
    if (!apiKey) {
      this.logger.warn('SENDGRID_API_KEY not found in environment variables');
      this.enabled = false;
    }

    sgMail.setApiKey(apiKey);
    this.emailSender = this.configService.get('SENDGRID_SENDER');
  }

  async sendEmail(mail: sg.MailDataRequired) {
    try {
      const transfer = await sg.send(mail);
      this.logger.info(`Email sent to ${mail.to}`);
      return transfer;
    } catch (error) {
      this.logger.warn(`Error sending email`, error);
      throw new Error(error);
    }
  }

  async send(
    email: Email,
    settings: sg.MailDataRequired['mailSettings'] = {},
  ): Promise<void> {
    if (!this.enabled) {
      this.logger.warn('Email sending is disabled');
      return;
    }

    try {
      await sgMail.send({ ...email, mailSettings: { ...settings } });
    } catch (err) {
      this.logger.warn(`error sending email`, err);
      throw new Error(err);
    }
  }

  async sendEmailFromTemplate<T>(
    template: EmailTemplate<T>,
    emailInfo: Partial<Email> & { to: EmailData[] },
    settings: sg.MailDataRequired['mailSettings'] = {},
  ) {
    if (!emailInfo.to.length) {
      throw new Error('No recipient found');
    }

    const { html, metadata } = await this.templateService.getTemplate(template);

    return this.send(
      {
        to: emailInfo.to,
        from: emailInfo.from ?? this.emailSender,
        subject: metadata.subject,
        html,
      },
      settings,
    );
  }
}
