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
