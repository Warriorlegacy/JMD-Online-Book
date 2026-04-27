import axios from "axios";

export interface KYCVerificationResult {
  verified: boolean;
  score: number;
  details: {
    fullName: string;
    dob: string;
    documentType: string;
    status: string;
  };
  error?: string;
}

export class KYCService {
  private readonly apiKey = process.env.DIDIT_KYC_API_KEY;
  private readonly baseUrl = "https://api.didit.io/v1";

  async verifyIdentity(documentData: { front: string; back: string; dob: string; address: string }): Promise<KYCVerificationResult> {
    if (!this.apiKey) throw new Error("DIDIT_KYC_API_KEY is not defined");

    try {
      const response = await axios.post(`${this.baseUrl}/verify`, {
        api_key: this.apiKey,
        documents: {
          front: documentData.front,
          back: documentData.back,
        },
        personal_info: {
          dob: documentData.dob,
          address: documentData.address,
        },
      });

      const data = response.data;
      return {
        verified: data.status === "verified",
        score: data.confidence_score,
        details: {
          fullName: data.extracted_name,
          dob: data.extracted_dob,
          documentType: data.document_type,
          status: data.status,
        },
      };
    } catch (error: any) {
      console.error("[KYCService] Verification error:", error.message);
      return {
        verified: false,
        score: 0,
        details: { fullName: "", dob: "", documentType: "", status: "failed" },
        error: error.response?.data?.message || error.message,
      };
    }
  }
}

export const kycService = new KYCService();
