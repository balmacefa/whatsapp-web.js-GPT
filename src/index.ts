import { main } from "./fbr_wa_gpt_lib/main";

if (typeof require !== "undefined" && require.main === module) {
    (async () => {
        await main();
    })();
}