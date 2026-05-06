"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PaginationBar } from "@/components/list/PaginationBar";

type ClientPaginationWrapperProps = {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
};

export function ClientPaginationWrapper({
  totalCount,
  currentPage,
  pageSize,
  totalPages,
}: ClientPaginationWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pagina", String(page));
    router.push(`?${params.toString()}`);
  };

  const handlePageSizeChange = (size: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limite", String(size));
    params.set("pagina", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <PaginationBar
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
}
