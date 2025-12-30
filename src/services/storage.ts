import { supabase } from "@/services/supabase";

export async function uploadAvatar(file: File, userId: string): Promise<string | null> {
    try {
        // 1. Clean up old avatars
        const { data: listData } = await supabase.storage
            .from('avatars')
            .list(userId);

        if (listData && listData.length > 0) {
            const filesToRemove = listData.map(x => `${userId}/${x.name}`);
            await supabase.storage
                .from('avatars')
                .remove(filesToRemove);
        }

        // 2. Upload new avatar
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                upsert: true
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Error uploading avatar:', error);
        return null;
    }
}

export async function uploadCrewAvatar(file: File, agentKey: string): Promise<string | null> {
    try {
        const path = `crew/${agentKey}`;

        // 1. Clean up old avatars for this agent
        const { data: listData } = await supabase.storage
            .from('avatars')
            .list(path);

        if (listData && listData.length > 0) {
            const filesToRemove = listData.map(x => `${path}/${x.name}`);
            await supabase.storage
                .from('avatars')
                .remove(filesToRemove);
        }

        // 2. Upload new avatar
        const fileExt = file.name.split('.').pop();
        const filePath = `${path}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                upsert: true
            });

        if (uploadError) {
            console.error("Upload error details:", uploadError);
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Error uploading crew avatar:', error);
        return null;
    }
}
