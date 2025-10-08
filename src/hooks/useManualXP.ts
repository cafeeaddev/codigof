import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useManualXP = () => {
  const { user, profile } = useAuth();
  const [manualXP, setManualXP] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchAndApplyManualXP = async () => {
      if (!profile?.email || !user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Buscar XP manual da tabela usando user_id (seguro)
        const { data: manualXPData, error: xpError } = await supabase
          .from('manual_xp_adjustments')
          .select('xp_value')
          .eq('user_id', user.id)
          .maybeSingle();

        if (xpError) {
          console.error('[useManualXP] Error fetching manual XP:', xpError);
          setIsLoading(false);
          return;
        }

        if (!manualXPData) {
          console.log('[useManualXP] No manual XP found for user:', user.id);
          setIsLoading(false);
          return;
        }

        const xpToAdd = manualXPData.xp_value;
        setManualXP(xpToAdd);

        // Verificar se já foi aplicado ao user_progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('total_xp, user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (progressError) {
          console.error('[useManualXP] Error fetching user progress:', progressError);
          setIsLoading(false);
          return;
        }

        if (progressData) {
          // Aplicar o XP manual ao total_xp
          const newTotalXP = (progressData.total_xp || 0) + xpToAdd;
          
          console.log('[useManualXP] Applying manual XP:', {
            user_id: user.id,
            currentXP: progressData.total_xp,
            manualXP: xpToAdd,
            newTotalXP
          });

          const { error: updateError } = await supabase
            .from('user_progress')
            .update({ total_xp: newTotalXP })
            .eq('user_id', user.id);

          if (updateError) {
            console.error('[useManualXP] Error updating XP:', updateError);
          } else {
            console.log('[useManualXP] Successfully applied manual XP bonus');
            setHasApplied(true);
            
            // Mostrar notificação de sucesso
            toast({
              title: "🎉 Bônus de XP Aplicado!",
              description: `Você recebeu ${xpToAdd} XP de bônus!`,
              duration: 5000,
            });
            
            // Remover o registro de XP manual para não aplicar novamente (usando user_id)
            await supabase
              .from('manual_xp_adjustments')
              .delete()
              .eq('user_id', user.id);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('[useManualXP] Unexpected error:', error);
        setIsLoading(false);
      }
    };

    fetchAndApplyManualXP();
  }, [profile?.email, user?.id]);

  return { manualXP, isLoading, hasApplied };
};
