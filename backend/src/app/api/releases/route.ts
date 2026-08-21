import { NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api'

export async function GET() {
  try {
    const supabase = await createApiClient()

    // No auth required for seeing releases, or maybe yes depending on requirement.
    // The instruction says "Return active releases suitable for the frontend Downloads UI."
    // Let's assume anyone can see active releases, or we can check auth just in case.
    const { data: releases, error } = await supabase
      .from('releases')
      .select('version, platform, architecture, download_url, checksum, release_notes, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching releases:', error)
      return NextResponse.json({ error: 'Failed to fetch releases' }, { status: 500 })
    }

    return NextResponse.json({ releases: releases || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
