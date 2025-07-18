"use client";

import * as React from "react";
import {
  AudioWaveform,
  BarChart2,
  Command,
  File,
  GalleryVerticalEnd,
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

// Sample data updated with new navigation items
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
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
        {
          title: "Program Grid",
          url: "/streams/program-grid",
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
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();

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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
