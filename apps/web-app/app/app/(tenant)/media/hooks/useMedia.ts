// apps/web-app/app/(tenant)/media/hooks/useMedia.ts

import { useState, useEffect, useCallback } from "react";

export const useMedia = ({ search, sort, filter, page, limit }: any) => {
  const [media, setMedia] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    const response = await fetch(
      `/api/media?search=${search}&sort=${sort}&filter=${filter}&page=${page}&limit=${limit}`
    );
    const data = await response.json();
    setMedia(data.media);
    setTotal(data.total);
    setIsLoading(false);
  }, [search, sort, filter, page, limit]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  return { media, total, isLoading, mutate: () => fetchMedia() };
};
