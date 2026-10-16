import { Router } from 'express';
import { z } from 'zod';

export const sourcesRouter = Router();

interface ProtectionSource {
  id: string;
  name: string;
  type: 'android_notification' | 'browser_extension' | 'authorized_api' | 'package_safety';
  description: string;
  enabled: boolean;
  permissionRequired: string;
  permissionGranted: boolean;
  supportedPackages?: string[];
  limitations: string;
}

const sourcesDatabase: ProtectionSource[] = [
  {
    id: 'src-android-notifications',
    name: 'Android Notification Listener Service',
    type: 'android_notification',
    description: 'Passively analyzes accessible incoming notifications from SMS, WhatsApp, Telegram, and Gmail with zero manual copying.',
    enabled: true,
    permissionRequired: 'Notification Access (BIND_NOTIFICATION_LISTENER_SERVICE)',
    permissionGranted: true,
    supportedPackages: [
      'com.google.android.apps.messaging',
      'com.whatsapp',
      'org.telegram.messenger',
      'com.google.android.gm'
    ],
    limitations: 'Inspects exposed notification text only. Does not access private end-to-end encrypted chat databases or hidden attachments.'
  },
  {
    id: 'src-browser-extension',
    name: 'Browser Web Navigation Protection (Chrome Extension)',
    type: 'browser_extension',
    description: 'Pre-inspects website destinations and credential phishing forms before page load in Chrome, Edge, and Brave.',
    enabled: true,
    permissionRequired: 'Extension WebNavigation & Notifications API',
    permissionGranted: true,
    limitations: 'Inspects URLs and DOM credential forms within the active browser session. Does not inspect private browser sessions unless permitted.'
  },
  {
    id: 'src-authorized-apis',
    name: 'Consented Email & Messaging API Integrations',
    type: 'authorized_api',
    description: 'Explicit OAuth 2.0 authorized account monitoring for users who require full mailbox threat screening.',
    enabled: false,
    permissionRequired: 'OAuth 2.0 User Consent',
    permissionGranted: false,
    limitations: 'Requires explicit user login and authorized scopes. Does not silently read third-party accounts without direct authorization.'
  },
  {
    id: 'src-app-safety',
    name: 'Application Package Metadata & Safety Heuristics',
    type: 'package_safety',
    description: 'Inspects authorized package metadata, installer sources, and suspicious permission combinations.',
    enabled: true,
    permissionRequired: 'Standard Package Visibility',
    permissionGranted: true,
    limitations: 'Inspects static metadata and permissions. Cannot monitor internal runtime memory of third-party sandboxed apps.'
  }
];

// GET /api/sources
sourcesRouter.get('/', (req, res) => {
  return res.json({
    sources: sourcesDatabase,
    allBackgroundServicesActive: sourcesDatabase.filter(s => s.enabled).length >= 2,
    activeMonitoringCount: sourcesDatabase.filter(s => s.enabled).length,
  });
});

// POST /api/sources/toggle
const ToggleSourceSchema = z.object({
  sourceId: z.string(),
  enabled: z.boolean(),
});

sourcesRouter.post('/toggle', (req, res, next) => {
  try {
    const { sourceId, enabled } = ToggleSourceSchema.parse(req.body);
    const source = sourcesDatabase.find(s => s.id === sourceId);
    if (!source) {
      return res.status(404).json({ error: 'Source not found' });
    }
    source.enabled = enabled;
    return res.json({ success: true, source });
  } catch (error) {
    next(error);
  }
});
