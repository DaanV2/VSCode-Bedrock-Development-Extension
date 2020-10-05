/*BSD 3-Clause License

Copyright (c) 2020, Blockception Ltd
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.*/
import { SignatureHelp, SignatureInformation, ParameterInformation } from 'vscode-languageserver';
import { Position } from 'vscode-languageserver-textdocument';
import { IDocument } from '../code/include';
import { CommandInfo } from '../minecraft/commands/CommandInfo';
import { CommandIntr, IsInSubCommand, MCCommand, MCCommandParameterType } from '../minecraft/commands/include';

export function ProvideSignature(doc: IDocument, pos: Position): SignatureHelp | undefined {
	let Line = doc.getLine(pos.line);
	let command: CommandIntr = CommandIntr.parse(Line, pos);

	if (command.IsEmpty())
		return undefined;

	let SubCommand = IsInSubCommand(command, pos.character);

	if (SubCommand != undefined) {
		command = SubCommand;
	}

	let Matches = command.GetCommandData();

	let Out: SignatureHelp = {
		signatures: ConverToSignatures(Matches),
		activeParameter: command.CursorParamater,
		activeSignature: 0
	};

	return Out;
}

function ConverToSignatures(Commands: CommandInfo[]): SignatureInformation[] {
	let Out: SignatureInformation[] = [];

	for (let I = 0; I < Commands.length; I++) {
		let Current = Commands[I];
		let Signature = Current.Signature;

		if (Signature == undefined) {
			Signature = ConverToSignature(Current.Command);
			Current.Signature = Signature;
		}

		Out.push(Signature);
	}

	return Out;
}

//Converts the given MCCommand into a signature
function ConverToSignature(Command: MCCommand): SignatureInformation {
	var Sign: SignatureInformation = {
		label: '',
		documentation: Command.description,
		parameters: []
	};

	let parameters = Command.parameters;
	for (let I = 0; I < parameters.length; I++) {
		let parameter = parameters[I];
		let p: ParameterInformation;

		if (parameter.Required) {
			if (parameter.Type === MCCommandParameterType.keyword) {
				p = {
					label: parameter.Text,
					documentation: "Type: " + MCCommandParameterType[parameter.Type]
				};
			}
			else {
				p = {
					label: "<" + parameter.Text + ">",
					documentation: "Type: " + MCCommandParameterType[parameter.Type]
				};
			}
		}
		else {
			p = {
				label: "[" + parameter.Text + "]",
				documentation: "Type: " + MCCommandParameterType[parameter.Type]
			};
		}

		Sign.label += p.label + ' ';

		Sign.parameters?.push(p);
	}

	return Sign;
}