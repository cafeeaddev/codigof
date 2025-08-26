import { supabase } from '@/integrations/supabase/client';

/**
 * Função para corrigir o game_base_xp de usuários que foram afetados pelo bug
 * Deve ser executada pelo admin para corrigir usuários já prejudicados
 */
export async function fixAffectedUsersXP() {
  try {
    console.log('🔧 Iniciando correção do XP dos usuários afetados...');
    
    // Buscar todos os usuários que completaram as 4 missões mas têm game_base_xp incorreto
    const { data: affectedUsers, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('missao_1_completed', true)
      .eq('missao_2_completed', true)
      .eq('missao_3_completed', true)
      .eq('missao_4_completed', true)
      .neq('game_base_xp', 100); // Usuários que não têm o valor correto de 100 XP
    
    if (error) {
      console.error('Erro ao buscar usuários afetados:', error);
      return { success: false, error };
    }
    
    if (!affectedUsers || affectedUsers.length === 0) {
      console.log('✅ Nenhum usuário afetado encontrado');
      return { success: true, correctedUsers: 0 };
    }
    
    console.log(`📊 Encontrados ${affectedUsers.length} usuários com XP incorreto:`, 
      affectedUsers.map(u => ({ 
        user_id: u.user_id, 
        current_game_base_xp: u.game_base_xp,
        total_xp: u.total_xp 
      }))
    );
    
    // Corrigir cada usuário
    const corrections = [];
    for (const user of affectedUsers) {
      try {
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({ 
            game_base_xp: 100 // Valor correto para 4 missões completadas
          })
          .eq('user_id', user.user_id);
          
        if (updateError) {
          console.error(`Erro ao corrigir usuário ${user.user_id}:`, updateError);
          corrections.push({ user_id: user.user_id, success: false, error: updateError });
        } else {
          console.log(`✅ Usuário ${user.user_id} corrigido: ${user.game_base_xp} → 100 XP`);
          corrections.push({ user_id: user.user_id, success: true, oldValue: user.game_base_xp, newValue: 100 });
        }
      } catch (err) {
        console.error(`Erro inesperado ao corrigir usuário ${user.user_id}:`, err);
        corrections.push({ user_id: user.user_id, success: false, error: err });
      }
    }
    
    const successfulCorrections = corrections.filter(c => c.success).length;
    console.log(`🎉 Correção finalizada: ${successfulCorrections}/${affectedUsers.length} usuários corrigidos`);
    
    return { 
      success: true, 
      correctedUsers: successfulCorrections,
      totalAffectedUsers: affectedUsers.length,
      corrections 
    };
    
  } catch (error) {
    console.error('Erro geral na correção do XP:', error);
    return { success: false, error };
  }
}

/**
 * Função para verificar o status do XP de um usuário específico
 */
export async function checkUserXPStatus(userId: string) {
  try {
    const { data: userProgress, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Erro ao buscar progresso do usuário:', error);
      return { success: false, error };
    }
    
    const completedMissions = [
      userProgress.missao_1_completed,
      userProgress.missao_2_completed,
      userProgress.missao_3_completed,
      userProgress.missao_4_completed
    ].filter(Boolean).length;
    
    const expectedGameBaseXP = completedMissions * 25;
    const isCorrect = userProgress.game_base_xp === expectedGameBaseXP;
    
    return {
      success: true,
      userProgress,
      completedMissions,
      expectedGameBaseXP,
      currentGameBaseXP: userProgress.game_base_xp,
      isCorrect,
      needsCorrection: !isCorrect && completedMissions === 4
    };
    
  } catch (error) {
    console.error('Erro ao verificar status do XP:', error);
    return { success: false, error };
  }
}