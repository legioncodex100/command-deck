export function generateCodename(): string {
    const prefixes = [
        "Cyber", "Neon", "Shadow", "Ghost", "Viper",
        "Echo", "Nova", "Rogue", "Zero", "Apex",
        "Iron", "Steel", "Dark", "Light", "Solar",
        "Lunar", "Void", "Null", "Binary", "Digital"
    ];

    const suffixes = [
        "Wolf", "Hawk", "Eagle", "Falcon", "Raven",
        "Prime", "One", "X", "Core", "Link",
        "Drifter", "Runner", "Hunter", "Scout", "Ace",
        "Blade", "Strike", "Storm", "Pulse", "Wave"
    ];

    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    // 30% chance of adding a number suffix
    const numberSuffix = Math.random() > 0.7 ? `-${Math.floor(Math.random() * 99) + 1}` : "";

    return `${randomPrefix}${randomSuffix}${numberSuffix}`.toUpperCase();
}
