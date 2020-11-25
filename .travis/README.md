# Travis encrypted files

This directory contains an encrypted private deploy key with write access to the
Prototype Kit repository.

It has been encrypted using a key stored in the DEPLOY_KEY environment
variable, which is itself encrypted using `travis encrypt`.

The deploy key is decrypted in create-release.sh.

To update the key:

1. Generate a new keypair using ssh-keygen
   
  ```
  ssh-keygen -b 4096 -f .travis/prototype-kit-deploy-key
  ```

2. Add the *public* key as a new [deploy key], with write access to the
   repository

  ```
  cat .travis/prototype-kit-deploy-key.pub
  ```

2. Generate a new random string which we can use as an encryption key

3. Encrypt the private key using ssh-keygen

  ```
  openssl aes-256-cbc -k [encryption key here] \
    -in prototype-kit-deploy-key \
    -out prototype-kit-deploy-key.enc
  ```

4. Remove the unencrypted private key and the public key

5. Encrypt the private key using the encryption key

  ```
  travis encrypt DEPLOY_KEY=[encryption key]
  ```

6. Add the encrypted variable to the environment variables for the deploy job
   in .travis.yml


[deploy key]: https://github.com/alphagov/govuk-prototype-kit/settings/keys
