const { Plugin } = require('powercord/entities');
const { get } = require('powercord/http');

const Settings = require('./Settings.jsx');

const wrapResult = (str) => `-- **Wolfram Alpha** --\n${str}\n------------------------`

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

                const input = args.join(' ');

                if (!input) {
                    return {
                        send: false,
                        result: `Invalid arguments. Run \`${powercord.api.commands.prefix}help wolfram\` for more information.`
                    };
                }

                let url = `https://api.wolframalpha.com/v1/result?appid=${appID}&i=${encodeURIComponent(input)}&units=metric`;
                
                try {
                    let res = await get(url)

                    if (res.statusCode == 200) {
                        let wMSG = wrapResult(`*Input:* ${input}\n*Output:* ${res.body.toString()}`);
                        return {
                            send,
                            result: wMSG,
                        };
                    }

                    return {
                        send: false,
                        result: `Unknown failure.`
                    };
                } catch (err) {
                    const error = err instanceof Error ? err.toString() : String(err)

                    return {
                        send: false,
                        result: wrapResult(`*Input:* ${input}\n*Error*: ${error}`)
                    };
                }
             }
        });
    }

    pluginWillUnload() {
        powercord.api.settings.unregisterSettings('wolfram');
        powercord.api.commands.unregisterCommand('wolfram');
    }
};
