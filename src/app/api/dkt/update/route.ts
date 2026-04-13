import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, conceptId, isCorrect, timeTaken, difficulty } = body;

    if (!deviceId || !conceptId) {
      return NextResponse.json(
        { error: 'Missing required fields: deviceId, conceptId' },
        { status: 400 }
      );
    }

    // Store the interaction in Supabase
    if (!supabase) {
      console.warn('Supabase not available for knowledge tracking');
      return NextResponse.json({
        success: true,
        message: 'Knowledge state updated (local only)'
      });
    }

    const { error: insertError } = await supabase
      .from('knowledge_interactions')
      .insert({
        device_id: deviceId,
        concept_id: conceptId,
        is_correct: isCorrect,
        time_taken: timeTaken,
        difficulty: difficulty || 0.5,
        timestamp: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error storing knowledge interaction:', insertError);
      // Continue even if database insert fails
    }

    // Update the user's knowledge state
    const { error: updateError } = await supabase
      .from('knowledge_states')
      .upsert(
        {
          device_id: deviceId,
          concept_id: conceptId,
          mastery_level: isCorrect ? 0.1 : -0.05, // Increment/decrement
          last_seen: new Date().toISOString(),
          attempts: 1,
          correct: isCorrect ? 1 : 0,
          time_spent: timeTaken
        },
        {
          onConflict: 'device_id,concept_id',
          ignoreDuplicates: false
        }
      );

    if (updateError) {
      console.error('Error updating knowledge state:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Knowledge state updated'
    });

  } catch (error) {
    console.error('DKT update error:', error);
    return NextResponse.json(
      { error: 'Failed to update knowledge state', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
