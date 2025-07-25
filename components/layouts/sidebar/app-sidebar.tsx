"use client";

import * as React from "react";
import {
  BarChart2,
  File,
  ImagePlayIcon,
  Tv,
} from "lucide-react";

import { NavMain } from "@/components/layouts/sidebar/nav-main";
import { NavUser } from "@/components/layouts/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { getUserData } from "@/services/auth.service";

// Sample data updated with new navigation items
const navMainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart2,
    isActive: false,
  },
  {
    title: "Streams",
    url: "/streams",
    icon: Tv,
    isActive: true,
    items: [
      {
        title: "Live Stream Table",
        url: "/streams/live-stream-table",
      },
    ],
  },
  {
    title: "Data Manipulation",
    url: "/data-manipulation",
    icon: File,
    isActive: true,
    items: [
      {
        title: "Image Labeling",
        url: "/data-manipulation/image-labeling",
      },
      {
        title: "Labeled Data",
        url: "/data-manipulation/labeled-data",
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();

  const [user, setUser] = React.useState({
    name: "",
    email: "",
    avatar: "/avatars/shadcn.jpg", // fallback
  });

  React.useEffect(() => {
    const { name, email } = getUserData();
    setUser({
      name: name ?? "Guest",
      email: email ?? "guest@example.com",
      avatar: "/avatars/shadcn.jpg", // or generate avatar dynamically
    });
  }, []);

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu className={`flex items-center flex-row ${open ? "justify-between" : "justify-center"}`}>
          {open && (
            <SidebarMenuItem className="flex gap-2">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <ImagePlayIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Indivisual</span>
                <span className="truncate text-xs">Monitoring</span>
              </div>
            </SidebarMenuItem>
          )}
          <SidebarTrigger />
        </SidebarMenu>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <NavMain items={navMainItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
