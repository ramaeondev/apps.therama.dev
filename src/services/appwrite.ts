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

// Appwrite project status document format
interface AppwriteProjectStatusDocument {
  $id: string;
  $sequence: number;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  name: string;
  description: string;
  class: string;
  [key: string]: unknown; // For any additional fields
}

// Transformed format matching Projects.tsx interface
export interface ProjectStatus {
  id: string;
  name: string;
  description: string;
  class: string;
}

// Appwrite project document format
interface AppwriteProjectDocument {
  $id: string;
  $sequence: number;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  title: string;
  description: string;
  technologies: string[];
  github_url: string;
  preview_url: string;
  image_web: string;
  image_mobile: string;
  status_id: string;
  current_version: string;
  is_public: boolean;
  readme_url: string;
  order: number;
  last_deployed_at?: string;
  status_name?: string;
  status_class?: string;
  status_description?: string;
  [key: string]: unknown; // For any additional fields
}

// Transformed format matching Projects.tsx interface
export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  github_url: string;
  preview_url: string;
  image_web: string;
  image_mobile: string;
  status_id: string;
  current_version: string;
  is_public: boolean;
  readme_url: string;
  order: number;
  last_deployed_at?: string;
  status_name?: string;
  status_class?: string;
  status_description?: string;
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

/**
 * Fetches project statuses from Appwrite database
 * @returns Promise<ProjectStatus[]> Array of project statuses
 */
export async function getProjectStatuses(): Promise<ProjectStatus[]> {
  try {
    const url = `${appwriteConfig.endpoint}/databases/${appwriteConfig.databaseId}/collections/project_statuses/documents`;
    
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

    const data: AppwriteResponse<AppwriteProjectStatusDocument> = await response.json();
    
    // Transform Appwrite documents to match the expected format
    return data.documents.map((doc) => ({
      id: doc.$id,
      name: doc.name,
      description: doc.description,
      class: doc.class,
    }));
  } catch (error) {
    console.error('Error fetching project statuses from Appwrite:', error);
    throw error;
  }
}

/**
 * Fetches projects from Appwrite database
 * @returns Promise<Project[]> Array of projects
 */
export async function getProjects(): Promise<Project[]> {
  try {
    const url = `${appwriteConfig.endpoint}/databases/${appwriteConfig.databaseId}/collections/projects/documents`;
    
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

    const data: AppwriteResponse<AppwriteProjectDocument> = await response.json();
    
    // Helper function to normalize technologies to an array
    const normalizeTechnologies = (tech: unknown): string[] => {
      if (Array.isArray(tech)) {
        return tech;
      }
      if (typeof tech === 'string') {
        try {
          // Try parsing as JSON first
          const parsed = JSON.parse(tech);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch {
          // If not JSON, try splitting by comma
          return tech.split(',').map(t => t.trim()).filter(t => t.length > 0);
        }
      }
      return [];
    };
    
    // Transform Appwrite documents to match the expected format
    return data.documents.map((doc) => ({
      id: doc.$id,
      title: doc.title,
      description: doc.description,
      technologies: normalizeTechnologies(doc.technologies),
      github_url: doc.github_url,
      preview_url: doc.preview_url,
      image_web: doc.image_web,
      image_mobile: doc.image_mobile,
      status_id: doc.status_id,
      current_version: doc.current_version,
      is_public: doc.is_public,
      readme_url: doc.readme_url,
      order: doc.order,
      last_deployed_at: doc.last_deployed_at,
      status_name: doc.status_name,
      status_class: doc.status_class,
      status_description: doc.status_description,
    }));
  } catch (error) {
    console.error('Error fetching projects from Appwrite:', error);
    throw error;
  }
}

export default {
  getSocialLinks,
  getProjectStatuses,
  getProjects,
  config: appwriteConfig,
};
