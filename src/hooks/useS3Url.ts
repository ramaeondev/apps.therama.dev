
import { useEffect, useState } from 'react';

export function useS3Url(filename: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!filename) return;
    // Reset before fetch
    setUrl(null);
    fetch("https://api.therama.dev/functions/v1/get-s3-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    })
      .then(res => res.json())
      .then(data => data?.url ? setUrl(data.url) : setUrl(null))
      .catch(() => setUrl(null));
  }, [filename]);

  return url;
}
