const { Plugin } = require('powercord/entities');
const { get } = require('powercord/http');

const Settings = require('./Settings.jsx');

module.exports = class Wolfram extends Plugin {
    async startPlugin() {
        const appID = this.settings.get('appID', '');

        powercord.api.settings.registerSettings('wolfram', {
            category: this.entityID,
            label: 'Wolfram',
            render: Settings
        });

        powercord.api.commands.registerCommand({
            command: 'wolfram',
            description: 'Lets you fetch a question from Wolfram',
            usage: '{c} [--send]',
            executor: async (args) => {
                const send = args.includes('--send')
                    ? !!args.splice(args.indexOf('--send'), 1)
                    : this.settings.get('send', false);

                const input = await args.join(' ');

                if (!input) {
                    return {
                        send: false,
                        result: `Invalid arguments. Run \`${powercord.api.commands.prefix}help wolfram\` for more information.`
                    };
                }

                let url = `https://api.wolframalpha.com/v1/result?appid=${appID}&i=${encodeURIComponent(input)}&units=metric`;
                let res = await get(url)

                if (res.statusCode == 200) {
                    let wMSG = `-- **Wolfram Alpha** --\n*Input:* ${input}\n*Output:* ${res.body.toString()}\n------------------------`;
                    return {
                        send,
                        result: wMSG,
                    };
                }

                return {
                    send: false,
                    result: `Unknown failure.`
                };
            }
        });
    }

    pluginWillUnload() {
        powercord.api.settings.unregisterSettings('wolfram');
        powercord.api.commands.unregisterCommand('wolfram');
    }
};
