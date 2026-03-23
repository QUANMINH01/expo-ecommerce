import { LoaderIcon } from "lucide-react";
import React from "react";

function PageLoader() {
  return (
    <div className="flex items-center justify-cente h-screen">
      <LoaderIcon className="size-12 animate-spin" />
    </div>
  );
}

export default PageLoader;
