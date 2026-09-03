import MyAccount from "@/components/MyAccount";
import React, { Suspense } from "react";
import { notFound } from "next/navigation";

import { Metadata } from "next";

const VALID_TABS = [
  "orders",
  "account-details",
  "add-product",
  "product-list",
  "edit-product",
];

export const metadata: Metadata = {
  title: "My Account | NextCommerce Nextjs E-commerce template",
  description: "This is My Account section for NextCommerce Template",
};

const MyAccountTabPage = async ({
  params,
}: {
  params: Promise<{ tab: string }>;
}) => {
  const { tab } = await params;

  if (!VALID_TABS.includes(tab)) {
    notFound();
  }

  return (
    <main>
      <Suspense>
        <MyAccount activeTab={tab} />
      </Suspense>
    </main>
  );
};

export default MyAccountTabPage;
