'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeroSection } from '@/components/cms/hero-section';
import { FeaturesSection } from '@/components/cms/features-section';
import { ExercisesSection } from '@/components/cms/exercises-section';
import { HealthSafetySection } from '@/components/cms/health-safety-section';
import { FooterSection } from '@/components/cms/footer-section';
import { usePermissions } from '@/components/providers/permission-provider';

export default function HomeCMSPage() {
  const { hasPermission } = usePermissions();
  
  // Check if user has permission to manage CMS
  const canManageCMS = hasPermission('cms_manage');

  if (!canManageCMS) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to manage CMS content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Homepage CMS</h1>
        <p className="text-muted-foreground">
          Manage the content displayed on the homepage.
        </p>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="exercises">Daily Exercises</TabsTrigger>
          <TabsTrigger value="health-safety">Health & Safety</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4">
          <HeroSection />
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <FeaturesSection />
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          <ExercisesSection />
        </TabsContent>

        <TabsContent value="health-safety" className="space-y-4">
          <HealthSafetySection />
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <FooterSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}