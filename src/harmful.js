/* 
	To all of which I do solemnly and sincerely promise and swear, without
	any hesitation, mental reservation, or secret evasion of mind in me
	whatsoever; binding myself under no less a penalty than that of having
	my throat cut across, my tongue torn out, and with my body buried in
	the sands of the sea at low-water mark, where the tide ebbs and flows
	twice in twenty-four hours, should I ever knowingly or willfully
	violate this, my solemn Obligation of a Javascript user.  So help
	me God and make me steadfast to keep and perform the same.
*/

module.exports.isIdentifierHarmful = function(ident)
{
	return !(/^[a-zA-Z0-9_][a-zA-Z0-9_!?-]{3,20}$/.test(ident));
}

module.exports.neutralizeHarmfulIdentifier = function(ident)
{
	let base = ident.replace(/[^a-zA-Z0-9_]/g, '');
	if (base.length > 20) base = base.slice(0, 20);
	while (base.length < 3) {
		base += `${Math.floor(Math.random()*10 + 0.5)}`;
	}
	return base;
}
