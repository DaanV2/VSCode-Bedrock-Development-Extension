import * as vscode from 'vscode';
import * as SD from "./SelectorDiagnostics";
import * as CD from "./CoordinateDiagnostics";
import { SyntaxTree } from '../../general/include';
import { DiagnosticProvider } from './DiagnosticsManager';
import * as Diagnostics from "./Diagnostics";
import * as Commands from "./commands/activate";

export function activate(context: vscode.ExtensionContext) {
    var Manager = Diagnostics.Manager;
    console.log("activating diagnostics");
    
    Manager.SelectorDiagnoser = new SD.SelectorDiagnosticProvider();
    Manager.CoordinateDiagnoser = new CD.CoordinateDiagnosticProvider();
    Commands.activate(Manager);
    
    //If window is open, create new diagnostics
	if (vscode.window.activeTextEditor) {
		updateDiagnostics(vscode.window.activeTextEditor.document, Diagnostics.collection);
    }

    //Register events
	context.subscriptions.push(
        //update
        vscode.workspace.onDidChangeTextDocument(e => updateDiagnostics(e.document, Diagnostics.collection)),
        //when window is changed
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                updateDiagnostics(editor.document, Diagnostics.collection);
            }
        }),
        //When closed remove data
        vscode.workspace.onDidCloseTextDocument(doc => Diagnostics.collection.delete(doc.uri)),
        //on save
        vscode.workspace.onDidSaveTextDocument(doc => {
            if (doc) {
                updateDiagnostics(doc, Diagnostics.collection);
            }
        })
    );
}

//Updates the content of the collection of diagnostis for the specified document
function updateDiagnostics(document : vscode.TextDocument, collection : vscode.DiagnosticCollection){
    if (!document.uri.fsPath.endsWith(".mcfunction"))
        return;

    var docCollection = new Array<vscode.Diagnostic>();
    var Diagnoser : DiagnosticProvider | undefined;
     
    for (var index = 0; index < document.lineCount; index++){
        var Line = document.lineAt(index);

        if (Line.text == "" || Line.text.startsWith("#"))
            continue;
        
        var Tree : SyntaxTree = SyntaxTree.ParseEntireTree(Line);
        var Item = Tree.Root;
        
        if (Item != undefined){
            Diagnoser = Diagnostics.Manager.get(Item);

            if (Diagnoser != undefined) {
                Diagnoser.provideDiagnostic(Item, index, docCollection, Diagnostics.Manager, document);
            }
        }
    }

    collection.set(document.uri, docCollection);
}