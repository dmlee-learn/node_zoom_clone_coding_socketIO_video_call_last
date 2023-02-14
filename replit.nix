{ pkgs }: {
	deps = [
		pkgs.psmisc
  pkgs.lsof
  pkgs.nodejs-18_x
    pkgs.nodePackages.typescript-language-server
    pkgs.yarn
    pkgs.replitPackages.jest
	];
}