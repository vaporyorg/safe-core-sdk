export interface SafeSignature {
  signer: string
  data: string
  staticPart(/* dynamicOffset: number */): string
  dynamicPart(): string
}

export class EthSignSignature implements SafeSignature {
  signer: string
  data: string

  /**
   * Creates an instance of a Safe signature.
   *
   * @param signer - Ethers signer
   * @param signature - The Safe signature
   * @returns The Safe signature instance
   */
  constructor(signer: string, signature: string) {
    this.signer = signer
    this.data = signature.replace(/1b$/, '1f').replace(/1c$/, '20')
  }

  /**
   * Returns the static part of the Safe signature.
   *
   * @returns The static part of the Safe signature
   */
  staticPart(/* dynamicOffset: number */) {
    return this.data
  }

  /**
   * Returns the dynamic part of the Safe signature.
   *
   * @returns The dynamic part of the Safe signature
   */
  dynamicPart() {
    return ''
  }
}
