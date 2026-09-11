'use client';
import { supabase } from './supabase';
import { validateState } from '@/app/validation';
import type { State } from '@/app/model';

export async function loadWorkspace() {
  const { data, error } = await supabase.from('workspace_snapshots').select('payload, revision').maybeSingle();
  if (error) throw error;
  if (data?.payload) validateState(data.payload);
  return { state: (data?.payload as State | null) ?? null, revision: data?.revision ?? 0 };
}

export async function saveWorkspace(state: State, revision: number) {
  validateState(state);
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw authError ?? new Error('Sign in before saving.');
  if (revision === 0) {
    const { data, error } = await supabase.from('workspace_snapshots').insert({ user_id: auth.user.id, payload: state, revision: 1 }).select('revision').single();
    if (error?.code === '23505') throw new Error('This workspace changed in another tab. Export your changes, then reload.');
    if (error) throw error;
    return data.revision as number;
  }
  const { data, error } = await supabase.from('workspace_snapshots').update({ payload: state, revision: revision + 1, updated_at: new Date().toISOString() }).eq('revision', revision).select('revision').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('This workspace changed in another tab. Export your changes, then reload.');
  return data.revision as number;
}
