import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

/**
 * # Password Hasher Service!
 *
 * ## Description
 *
 * This service provides methods for hashing and comparing passwords.
 *
 * ## Methods
 *
 * - HashPassword
 * - ComparePassword
 *
 * ## Usage
 *
 * ```typescript
 * import { Injectable } from '@nestjs/common';
 * import * as bcrypt from 'bcryptjs';
 * ```
 *
 * ## Notes
 *
 * - The bcryptjs library is a JavaScript implementation of the bcrypt algorithm.
 * - The salt factor of 10 used in this method is a reasonable default value that balances security
 *   and performance. Higher values increase security but also increase the time required to hash
 *   the password.
 *
 * @class
 * @param {string} password - Password
 * @param {string} oldPassword - Old Password
 * @param {string} hashedPassword - Hashed Password
 * @param {string} salt - Salt
 *
 *   ## Returns
 * @returns {Promise<boolean>} - Promise that resolves to a boolean value indicating whether the
 *   password matches the hashed password.
 *
 *   ## Links
 * @see {@link hashPassword}
 * @see {@link comparePassword}
 */
@Injectable()
export class PassHasherService {
  /**
   * # Method: HashPassword!
   *
   * ## Description
   *
   * This method hashes a password using the bcryptjs library.
   *
   * ## Usage
   *
   * @example
   *   ```typescript
   *   const password = 'myPassword123';
   *   const hashedPassword = await hashPassword(password);
   *   ```
   *
   *   ## Parameters
   *
   * @param - **Password(required)**: A string representing the password to be hashed.
   *
   *   ## Returns
   * @returns This method returns a Promise that resolves to the hashed password string.
   *
   *   ## Notes
   * @notes - The bcryptjs library is a JavaScript implementation of the bcrypt algorithm.
   * - The salt factor of 10 used in this method is a reasonable default value that balances security and performance. Higher values increase security but also increase the time required to hash the password.
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const hashPassword = await bcrypt.hash(password, 10);
      if (!hashPassword)
        throw new HttpException(
          'failed_to_hash_password',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      return hashPassword;
    } catch (e) {
      console.log(e.message);
      throw e;
    }
  }

  /**
   * # Method: ComparePassword!
   *
   * ## Description
   *
   * This method compares a password to a hashed password using the bcryptjs library.
   *
   * ## Usage
   *
   * @example
   *   ```typescript
   *   const password = 'myPassword123';
   *   const hashedPassword = await hashPassword(password);
   *   const isMatch = await comparePassword(password, hashedPassword);
   *
   *   ```
   *
   *   ## Parameters
   *
   * @param - **Password(required)**: A string representing the password to be compared.
   *
   *   - **OldPassword(required)**: A string representing the hashed password to be compared.
   *
   *   ## Returns
   * @returns This method returns a Promise that resolves to a boolean value indicating whether the
   *   password matches the hashed password.
   *
   *   ## Notes
   * @notes - The bcryptjs library is a JavaScript implementation of the bcrypt algorithm.
   * - The salt factor of 10 used in this method is a reasonable default value that balances security and performance. Higher values increase security but also increase the time required to hash the password.
   */

  async comparePassword(
    password: string,
    oldPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, oldPassword);
  }
}
