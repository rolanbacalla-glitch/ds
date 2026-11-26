import { redirect } from "next/navigation";
import { COMPONENT_SLUGS, type ComponentSlug } from "@/lib/component-registry";

export function generateStaticParams() {
  return COMPONENT_SLUGS.map((componentName) => ({
    componentName,
  }));
}

export default async function LegacyComponentPortalRedirect({
  params,
}: {
  params: Promise<{ componentName: string }>;
}) {
  const { componentName } = await params;
  if (COMPONENT_SLUGS.includes(componentName as ComponentSlug)) {
    redirect(`/?spec=${componentName}#components`);
  }
  redirect("/#components");
}
