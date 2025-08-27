var MODULE = (function () {
    var mod = {};

    mod.RoomType = {
        LINUX: "LINUX",
        WINDOWS: "WINDOWS",
        C_HUSET: "C-HUSET",
        A_HUSET: "A-HUSET",
        GRUPP: "GRUPPRUM",
    }

    mod.DEFAULT_CHECKED = mod.RoomType.LINUX;

    const LINUX_URL = "https://cloud.timeedit.net/liu/web/schema/ri689Q18Y20" +
        "Z38Q5X4802186y1Z6505XX469199Q3175856X8518XXX989986811886X6X88880811" +
        "8186661887XX15999916X28866689995138X9916167584X98808911XQ99X668X896" +
        "981yZoXyZcbUmQLllWwZu0WZ65dyQQdlcolnSp58qWX7c90m5yRa55XW03h2nL%C3%A" +
        "4njQW3v9aoZaQ690Z.ics";

    const WINDOWS_URL = "https://cloud.timeedit.net/liu/web/schema/ri685Q18Y" +
        "00Z69Q5X8802196y9Z6505XX465119Q1170283X4519XXX212217297817X7X509170" +
        "911991121133XX91692217X10116658750198X2616465870X80878611XX88X668X9" +
        "77781WX6X58Z93b1Z285014QcYyluoX7q5lX5QZl6W7Zy18o98mQ4l275UQ5Sh5ynnX" +
        "cXdvR58%C3%A493WaQ06ZWjwdZaQc3m95p0WWL2nyoa960L.ics";

    const GROUP_ROOMS_URL = "https://cloud.timeedit.net/liu/web/schema/ri681" +
        "Q18Y88Z61Q5X9838186y1Z6578XX462179Q6178886X2111XXX074048617896X8X47" +
        "4857618646675975XX16944416X80699930337500X0059598015X00060955XX00X9" +
        "90X333305WX9X5519303X00065409Y5X2XX3455X0X779434952090094401645700X" +
        "8XX906151200409199124191900517950715XXXX1005350009X9912550XX40145X5" +
        "50X465052200XX7003099W6729X00522595509YX0292292097056XX0X0340X99024" +
        "X08515X1449041834830X09944X5X001606196096XX16442489633836X9912XXX68" +
        "6696915886X6X18191X119116W36884XX1266665668Y016616221198X5616162647" +
        "X68898311X866X668X4222816X6X1145316X8X66338481X6XX6666X6X0063336116" +
        "6082768818618XX8XX676858670786986118668W61147918881XX3X87Y9945776X6" +
        "688828XX84848X811X191118888XX1731811113841X18898999721X111797979714" +
        "9XX7X7891X99198X48999X6919110719X11X19998X4X31552909W299X1898996298" +
        "77Y71X9499XXX172119198779X9X118151981989978778XX96112189X9199Q0ZlWu" +
        "Qc1l52o7Xy5R9mmZcQ0bZ56WQplWo0y5l8UdqSZwnaLcLy9o5an%C3%A4yQWdW9j36Z" +
        "vh2XZ8Qna03.ics";

    const C_URL = "https://cloud.timeedit.net/liu/web/schema/ri687Q18Y88Z66Q" +
        "5X6808186y1Z6558XX463169Q6178886X8616XXX888896617886X6X989698118196" +
        "641880XX11888816X88669618942198X8616563808X8X89Y411X858X6W889919816" +
        "X8X1116127X8X86118181X2XX6288X8X886812611865138881626888X6XX6863140" +
        "888867W6183463688115718831XXXX48X581668WX64119988X48481X15YX9318144" +
        "Y28X8552X46664498X80111611808X9666141868896XX8X8789X66915X91111X519" +
        "6994781881X96811X6X511411666161XX8W118016788288X8058XXZ5Y164W192XY6" +
        "X8X88Z48Q811586y8cX89111961o5y8lmZ1Q5Xq9dU57b0yllWwZ0ma9QQ8lpR5yc5L" +
        "%C3%A4Wc5X0SoudWW36W2anL6aZZvhQ9nnQjo03.ics";

    const A_URL = "https://cloud.timeedit.net/liu/web/schema/ri636Q67Y09Z83Q" +
        "5X2876158y9Z6554XX459189Q6679795X9295XXX464466298776X6X373317113136" +
        "63y774XX14544115Z9Q7y0wuWdqRZm5nol60cX5cyblaZSQlmWco3l9L5Q0QZWdUp7X" +
        "y855v9a3LZah20ZWjQo%C3%A4nQ69nW.ics";

    mod.ROOM_URLS = new Map([
        [mod.RoomType.LINUX, LINUX_URL],
        [mod.RoomType.WINDOWS, WINDOWS_URL],
        [mod.RoomType.C_HUSET, C_URL],
        [mod.RoomType.A_HUSET, A_URL],
        [mod.RoomType.GRUPP, GROUP_ROOMS_URL]
    ]);

    mod.ROOMS = new Map([
        [
            mod.RoomType.LINUX, [
                "Bakdörren", "Brandväggen",
                "SU00", "SU01", "SU02", "SU03", "SU04", "SU10", "SU11", "SU12",
                "SU13", "SU14", "SU15", "SU17", "SU24", "SU25", 
                "Olympen", "Egypten", "Asgård",
            ],
        ],
        [
            mod.RoomType.WINDOWS, [
                "PC1", "PC2", "PC3", "PC4", "PC5", "Alfheim", "Bifrost", 
                "Elivågor", "Fahlstedt", "Franklin", "Gimle", "Glase",
                "Glitner", "Medielab", "Nobelsalen", "SH4162", "Valhall", 
                "Folkvang1", "Folkvang2", "Folkvang3", "Folkvang4",
            ],
        ],
        [
            mod.RoomType.C_HUSET, [
                "P18", "P22", "P30", "P34", "P36", "P42", "P44",  // "R6",
                "R18", "R19", "R22", "R23", "R26", "R27", "R34", "R35", "R36",
                "R37", "R41", "R42", "R43", "R44", "S2", "S3", "S6", "S7",
                "S10", "S11", "S14", "S15", "S18", "S19", "S22", "S23", "S25",
                "S26", "S27", "S35", "S37", "T1", "T2", "T11", "T15", "T19",
                "T23", "T27", "U1", "U2", "U3", "U4", "U5", "U6", "U7", "U10", 
                "U11", "U14", "U15",
            ]
        ],
        [
            mod.RoomType.A_HUSET, [
                "A25", "A31", "A32", "A33", "A34", "A35", "A36", "A37", "A38",
                "A301", "A302", "A303",
            ]
        ],
        [
            mod.RoomType.GRUPP, [
                "PG1", "PG2", "RG1", "RG2", "RG3", "SG1", "A300", "A301", 
                "AG21", "AG22", "AG23", "AG24", "AG31", "AG32", "AG33", "AG34",
                "AG35", "AG36", "AG261", "AG262", "AG263", "AG264", "AG265",
                "AG266", "AG267", "AG268", "AG269", "AG270", "AG271", "AG341",
                "AG342", "AG343", "AG344", "AG345", "AG346", "AG347", "AG348",
                "AG349", "AG350", "AG351", "AG352", "AG353", "AG354", "AG355",
                "AG356", "AG357", "FE241", "FE243", "FE244", "FE245", "FE246",
                "IG10", "IG11", "IG12", "IG13", "IG14", "IG15", "IG16", "IG17",
                "IG20", "IG21", "ISYtan1", "ISYtan2", "ISYtan3", "ISYtan4",
                "ISYtan5", "ISYtan6", "ISYtan7", "ISYtan8", "ISYtan9",
                "ISYtan10", "KG21", "KG22", "KG23", "KG31", "KG32", "KG33",
                "KG34", "KG35", "KG36", "KG37", "KG41", "KG42", "KG43", "KG44",
                "KG45", "KG47", "KG48", "KG49", "SH401", "SH402", "SH403",
                "SH404", "SH405", "SH406", "SH407", "SH408", "SH501", "SH502",
                "SH503", "SH504", "SH505", "SH506", "SH601", "SH602", "SH603",
                "SH604", "SH605",
            ]
        ]
    ]);

    return mod;
}());