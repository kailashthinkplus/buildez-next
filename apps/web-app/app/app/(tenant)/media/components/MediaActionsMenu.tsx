// apps/web-app/app/(tenant)/media/components/MediaActionsMenu.tsx

import { Trash, Eye } from "lucide-react";

const MediaActionsMenu = ({ item, onDelete }: any) => {
  return (
    <div className="flex space-x-2">
      {/* Preview Media */}
      <button
        onClick={() => window.open(item.url, "_blank")}
        className="text-sm text-blue-600 hover:underline"
      >
        <Eye className="w-5 h-5" />
      </button>
      
      {/* Delete Media */}
      <button
        onClick={() => onDelete(item.id)}
        className="text-sm text-red-600 hover:underline"
      >
        <Trash className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MediaActionsMenu;
