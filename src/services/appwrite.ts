const appwriteConfig = {
  endpoint: 'https://api-v2.therama.dev/v1',
  projectId: '692a8520001d66741068',
  apiKey: 'standard_98617bb627244f29ae6257873c4c24d71fe96953e7719d16df6f424d5b02606f277e967b9d9fa1157959ac7c535af81b8b04a4f4c61357ca9371c45e018eb39ec11310677c112602f206529c1168889be4a1b3ef218880be854d7c97d54d48a18dc645beeaf94ed2cd66881630840d1550d30176c38f159380b1ed98a0df759d',
  databaseId: 'devpad_main',
};

// Appwrite document format (matches actual API response)
interface AppwriteSocialLinkDocument {
  $id: string;
  $sequence: number;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  platform: string;
  url: string;
  icon: string;
  display_name: string;
  order: number;
  is_active: boolean;
}

// Transformed format matching Projects.tsx interface
export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
  created_at: string;
}

interface AppwriteResponse<T> {
  documents: T[];
  total: number;
}

/**
 * Fetches social links from Appwrite database
 * @returns Promise<SocialLink[]> Array of social links
 */
export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const url = `${appwriteConfig.endpoint}/databases/${appwriteConfig.databaseId}/collections/social_links/documents`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': appwriteConfig.projectId,
        'X-Appwrite-Key': appwriteConfig.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Appwrite API error: ${response.status} ${response.statusText}`);
    }

    const data: AppwriteResponse<AppwriteSocialLinkDocument> = await response.json();
    
    // Filter active links, sort by order, then transform to expected format
    return data.documents
      .filter((doc) => doc.is_active)
      .sort((a, b) => a.order - b.order)
      .map((doc) => ({
        id: doc.$id,
        platform: doc.platform,
        url: doc.url,
        label: doc.display_name,
        created_at: doc.$createdAt,
      }));
  } catch (error) {
    console.error('Error fetching social links from Appwrite:', error);
    throw error;
  }
}

export default {
  getSocialLinks,
  config: appwriteConfig,
};
