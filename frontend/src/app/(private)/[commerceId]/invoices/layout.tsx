import { FilesProvider } from "@/contexts/image-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <FilesProvider>{children}</FilesProvider>;
}