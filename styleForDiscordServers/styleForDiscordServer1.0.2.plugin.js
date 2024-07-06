/**
 * @name StyleForDiscordServer
 * @version 1.0.2
 * @description Плагин для установки стилей серверов Discord
 * @author ForseNight
 */

const fs = require('fs');

module.exports = class StyleForDiscordServer {
    constructor() {
        let startUrl = process.cwd();
        this.pluginUrl = this.getPluginUrl();
        process.chdir(startUrl);
        this.iconLink = "";
        this.imgAndId = this.getArrayOfImgAndId();
    }

    start() {
        this.createDatabase();
        const elements = document.querySelectorAll('.wrapper_f90abb, .focusLock_f9a4c9');

        let link = BdApi.loadData("discordStyleBD",BdApi.findModuleByProps('getLastSelectedGuildId').getLastSelectedGuildId());
        this.setStyleForDiscord(link);

        elements.forEach(element => {
            element.addEventListener('click', () => {
                if (element.classList.contains('wrapper_f90abb')) {
                    setTimeout(() => {
                        let link = BdApi.loadData("discordStyleBD",BdApi.findModuleByProps('getLastSelectedGuildId').getLastSelectedGuildId());
                        BdApi.injectCSS("style",""); this.setStyleForDiscord(link);
                    }, 0.0001);
                } else if (element.classList.contains('focusLock_f9a4c9')) {
                    this.createDatabase();
                }
            });
        });
    }

    stop() {
        BdApi.injectCSS("style", "");
    }

    getArrayOfImgAndId() {
        let guildIds = this.getDiscordIdServer();
        let imgLinks = this.getLinkOfDiscordServerIcon();
        let result = [];
        for (let i = 0; i < guildIds.length; i++) {
            let found = false;
            for (let j = 0; j < imgLinks.length; j++) {
                if (imgLinks[j].includes(`icons/${guildIds[i]}`)) {
                    result.push({ id: guildIds[i], link: imgLinks[j] });
                    found = true;
                    break;
                } 
            }
            if (!found) {
                result.push({ id: guildIds[i], link: this.iconLink });
            }
        }
    
        return result;
    }

    getDiscordIdServer() {
        const guildIds = BdApi.findModuleByProps('getGuilds').getGuilds();
        const currentIds = Object.values(guildIds).map(guildIds => guildIds.id);
        return currentIds;
    }
    
    getLinkOfDiscordServerIcon(){
        const elements = document.querySelectorAll('.icon_f90abb');
        const imgList = [];
        elements.forEach(element => {
            const imageUrl = element.getAttribute('src');
            imgList.push(imageUrl);
        });
        return imgList;
    }

    setStyleForDiscord(url) {
        function loadCSS(url) {
            return fetch(url)
                .then(response => response.text())
                .then(css => {
                    BdApi.injectCSS("style", css);
                });
        }
        if (url.includes("https://") || url.includes("http://")) {
            loadCSS(url);
        } else {
            fs.readFile(url, 'utf8', (err, data) => {
                console.error(err)
                BdApi.injectCSS("style", data);
            });
        }
    }

    createDatabase() {
        const filePath = `${this.pluginUrl}\\discordStyleBD.config.json`;
        fs.readFile(filePath, 'utf8', (err, data) => {
            let idDs = this.getDiscordIdServer();
            if (!data) {
                idDs.forEach(discordId => {
                    BdApi.saveData("discordStyleBD", discordId, "");
                });
            } else {
                idDs.forEach(discordId => {
                    if (!data.includes(discordId)) {
                        BdApi.saveData("discordStyleBD", discordId, "");
                    }
                });
            }
        });
    }

    getPluginUrl() {
        let currentWorkingDirectory = process.cwd();
        if ("Roaming\\BetterDiscord\\plugins" && currentWorkingDirectory.includes("C:\\Users\\") && currentWorkingDirectory.includes("\\AppData\\Local\\Discord\\app") && !currentWorkingDirectory.includes("Roaming\\BetterDiscord\\plugins")) {
            process.chdir('../../..'); 
            process.chdir("Roaming\\BetterDiscord\\plugins");
            currentWorkingDirectory = process.cwd();
            return currentWorkingDirectory;
        }
        return currentWorkingDirectory;
    }

    getSettingsPanel() {
        let reactElements = [];
        const handleInputChange = (id, value) => {
            BdApi.saveData("discordStyleBD", id, value);
            console.log(BdApi.loadData("discordStyleBD", id))
            try {
                this.setStyleForDiscord(BdApi.loadData("discordStyleBD", id));
            } catch (error) {
                BdApi.injectCSS("style","");
                console.error(error);
            }
        };
        for (let i = 0; i < this.imgAndId.length; i++) {
            let text = BdApi.loadData("discordStyleBD", this.imgAndId[i].id) || "";
            reactElements.push(
                BdApi.React.createElement(
                    "div",
                    { key: `container-${i}`, style: { display: "flex", alignItems: "center", marginBottom: "10px" } },
                    [
                        BdApi.React.createElement("img", {
                            key: `img-${i}`,
                            src: this.imgAndId[i].link,
                            style: {
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                            },
                        }),
                        BdApi.React.createElement("input", {
                            key: `input-${i}`,
                            defaultValue: text,
                            type: "text",
                            style: {
                                width: "150px",
                                marginLeft: "10px",
                            },
                            onChange: (event) => {
                                const value = event.target.value;
                                handleInputChange(this.imgAndId[i].id, value);
                            }
                        }),
                        BdApi.React.createElement(
                            "h3",
                            { key: `h3-${i}`, style: { color: "#fff", marginLeft: "10px" } },
                            this.imgAndId[i].id
                        )
                    ]
                )
            );
        }
        return BdApi.React.createElement("div", { style: { display: "flex", flexDirection: "column" } }, reactElements);
    }
};
