import { Outlet } from "react-router";
import CategorySync from "@/components/CategorySync";
import TopBar from "./TopBar";
import Header from "./Header";
import CategoryNav from "./CategoryNav";
import Footer from "./Footer";

const StoreLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CategorySync />
      <TopBar />
      <Header />
      <CategoryNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default StoreLayout;
