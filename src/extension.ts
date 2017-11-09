'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as js2flowchart from 'js2flowchart';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "code-flowchart" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    // let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed
    //     var editor = vscode.window.activeTextEditor;
    //     if (!editor) {
    //         return; // No open text editor
    //     }
        
    //     var selection = editor.selection;
    //     var text = editor.document.getText(selection);
    //     const svg = js2flowchart.convertCodeToSvg(text)
    //     // Display a message box to the user
    //     vscode.window.showInformationMessage('Hello World!');
    // });

//    context.subscriptions.push(disposable);


	let previewUri = vscode.Uri.parse('js-preview://authority/js-preview');
    
        class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
            private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    
            public provideTextDocumentContent(uri: vscode.Uri): string {
                return this.createJsPreview();
            }
    
            get onDidChange(): vscode.Event<vscode.Uri> {
                return this._onDidChange.event;
            }
    
            public update(uri: vscode.Uri) {
                this._onDidChange.fire(uri);
            }
    
            private createJsPreview() {
                let editor = vscode.window.activeTextEditor;
                if (!(editor.document.languageId === 'javascript')) {
                    return this.errorSnippet(`Active editor doesn't show a JS document - nothen to preview. ${editor.document.languageId}`)
                }
                return this.extractSnippet();
            }
    
            private extractSnippet(): string {
                let editor = vscode.window.activeTextEditor;
                let text = editor.document.getText();
                // let selStart = editor.document.offsetAt(editor.selection.anchor);
                // let propStart = text.lastIndexOf('{', selStart);
                // let propEnd = text.indexOf('}', selStart);
    
                // if (propStart === -1 || propEnd === -1) {
                //     return this.errorSnippet("Cannot determine the rule's properties.");
                // } else {
                //     return this.snippet(editor.document, propStart, propEnd);
                // }
                const svg = js2flowchart.convertCodeToSvg(text)
                return this.snippet(svg)
            }
    
            private errorSnippet(error: string): string {
                return `
                    <body>
                        ${error}
                    </body>`;
            }
    
            private snippet(svg): string {
                // const properties = document.getText().slice(propStart + 1, propEnd);
                return  `
                <body>
                    ${svg}
                </body>`
            }
        }
    
        let provider = new TextDocumentContentProvider();
        let registration = vscode.workspace.registerTextDocumentContentProvider('js-preview', provider);
    
        vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
            if (e.document === vscode.window.activeTextEditor.document) {
                provider.update(previewUri);
            }
        });
    
        vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
            if (e.textEditor === vscode.window.activeTextEditor) {
                provider.update(previewUri);
            }
        })
    
        let disposable = vscode.commands.registerCommand('extension.showJsFlowchart', () => {
            return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'JS Flowchart').then((success) => {
            }, (reason) => {
                vscode.window.showErrorMessage(reason);
            });
        });
    
        let highlight = vscode.window.createTextEditorDecorationType({ backgroundColor: 'rgba(200,200,200,.35)' });
    
        // vscode.commands.registerCommand('extension.revealCssRule', (uri: vscode.Uri, propStart: number, propEnd: number) => {
    
        //     for (let editor of vscode.window.visibleTextEditors) {
        //         if (editor.document.uri.toString() === uri.toString()) {
        //             let start = editor.document.positionAt(propStart);
        //             let end = editor.document.positionAt(propEnd + 1);
    
        //             editor.setDecorations(highlight, [new vscode.Range(start, end)]);
        //             setTimeout(() => editor.setDecorations(highlight, []), 1500);
        //         }
        //     }
        // });
    
        context.subscriptions.push(disposable, registration);
}

// this method is called when your extension is deactivated
export function deactivate() {
}