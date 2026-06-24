// apps/web-app/app/(tenant)/media/hooks/useMedia.ts

import { useState, useEffect } from "react";

export const useMedia = ({ search, sort, filter, page, limit }: any) => {
  const [media, setMedia] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoading(true);
      const response = await fetch(
        `/api/media?search=${search}&sort=${sort}&filter=${filter}&page=${page}&limit=${limit}`
      );
      const data = await response.json();
      setMedia(data.media);
      setTotal(data.total);
      setIsLoading(false);
    };

    fetchMedia();
  }, [search, sort, filter, page]);

  return { media, total, isLoading, mutate: () => fetchMedia() };
};
