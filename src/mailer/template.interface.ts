export enum TemplateTypeEnum {
  emailConfirmation = 'email-confirmation',
  forgotPassword = 'forgot-password',
}

export type EmailMetadata = {
  subject: string;
};

export abstract class EmailTemplate<T> {
  constructor(public context: T) {}
  public name: TemplateTypeEnum;
  get data(): T | unknown {
    return this.context;
  }
}

export interface BuiltTemplate {
  html: string;
  metadata: {
    subject: string;
  };
}

export class SignupVerifyEmailDto extends EmailTemplate<{
  verificationRedirectLink: string; // redirect to frontend with token
  email: string;
}> {
  name = TemplateTypeEnum.emailConfirmation;
}

export class ForgotPasswordMailDto extends EmailTemplate<{
  verificationRedirectLink: string;
  email: string;
}> {
  name = TemplateTypeEnum.forgotPassword;
}
