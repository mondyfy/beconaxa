import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand(
		'extension.checkFolderAndFileNames',
		() => {
			const fileRule = /^[a-zA-Z0-9_]+$/; // Snake case alphanumeric with underscores
			const folderRule = /^[a-z][a-zA-Z0-9]*$/; // Camel case alphanumeric with lowercase first letter

			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders) {
				vscode.window.showErrorMessage('No workspace folder opened.');
				return;
			}

			const invalidItems: vscode.Uri[] = [];
			for (const folder of workspaceFolders) {
				if (folder.uri.scheme !== 'file') {
					continue;
				}

				const folderName = folder.name;
				if (!folderRule.test(folderName)) {
					invalidItems.push(folder.uri);
				}

				vscode.workspace
					.findFiles('**', undefined, undefined, undefined)
					.then((files) => {
						for (const file of files) {
							if (file.scheme !== 'file') {
								continue;
							}

							const fileName = file.fsPath.substring(
								file.fsPath.lastIndexOf('/') + 1
							);
							if (!fileRule.test(fileName)) {
								invalidItems.push(file);
							}
						}

						if (invalidItems.length > 0) {
							const items = invalidItems.map((item) => item.fsPath).join('\n');
							vscode.window.showErrorMessage(
								`Invalid names found:\n${items}`
							);
						} else {
							vscode.window.showInformationMessage('All names are valid.');
						}
					});
			}
		}
	);

	context.subscriptions.push(disposable);
}

export function deactivate() { }
