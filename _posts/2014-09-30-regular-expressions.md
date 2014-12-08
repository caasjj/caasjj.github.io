---
title:  "Regular Expressions"
date: Monday September 29, 2014, 7:45 AM AM/PM
categories: journal
---     

Regular expressions (RE henceforth) are critical to web programming.  Here, we review their fundamentals and then look at support for RE in Javascript.

### Regular Expressions Overview

Let's first present some terms and definitions that will become very useful as we examine details of various matching forms.

The general form of a JavaScript regular expression is:

`/pattern/flags</code>`

or

`RegExp(pattern[, flags])`

These are essentially identical.

### Patterns

The `pattern` component of the RE is composed of the following groups of items:

#### Anchors

These locate a specific point in the string being operated on by the RE.  They consist of:

 1. `^`: beginning of string
 2. `$`: end of string
 3. `\b`: word boundaries
 4. `\B`: anywhere but word boundaries

Each of the above characters will match the indicated section of the string.

#### Character Sets

 1. `.`       : any single character</li>
 2. `\s \S`   : any whitespace character</li>
 3. `\d \D`   : any digit character, 0-9</li>
 4. `\w \W`   : any word character, i.e. alphanumeric and &#8216;_&#8217;</li>
 5. `\xff`    : (ff a 8 bit HEX number) any ASCII character</li>
 6. `\x{ffff}`: (ffff a 16 bit HEX number) any UTF-8 character</li>
 7. `cA`      : ASCII ^A (not case sensitive, i.e. ^a and ^A are the same)</li>
 8. `\132`    : ASCII character, octal notation (x5A in this case)</li>

Each of the above will match <em>a single character</em>, as indicated in the description.

#### Bracket Expressions


 1. `[adf]`   : any characters included in the set, i.e. a,d or f.
 2. `[^adf]`  : any character, except for a,d or f.
 3. `[a-f]`   : any character in the range of a-f, i.e. any of a,b,c,d,e,f</li>
 4. `[A-F]`   : any character in the range of A-F, i.e. any of A,B,C,D,E,F </li>
 5. `[0-9]`   : any numeric character

The caret, &#8216;^&#8217;, character negates a set. i.e. instead of matching <em>only</em> the characters included in the set, it matches all characters <em>except</em> for those included in the set.


####Special Characters

 1. `\1`   : escapes a metacharacter, such as ?, [, or (.
 2. `\t`   : a tab character
 3. `\n`   : a newline character</li>
 4. `\r`   : a carriage return character</li>
 5. `\v`   : a vertical tab / page break character</li>

> Several characters have special meaning in RE - (, [, ?, ^, etc.  In order to match these as string literals in the text, they must be escaped.  This is done with '\', i.e. \( to match '(', \\ to match '\', etc.

<h4>Quantifiers</h4>
<ol>
<li><code>*</code>       : 0 or more, matching as many as possible before going to next token (greedy)</li>
<li><code>*?</code>   : 0 or more, matching as few as possible before going to next token(lazy)</li>
<li><code>+</code>   : 1 or more (greedy)</li>
<li><code>+?</code>   : 1 or more (lazy)</li>
<li><code>?</code>   : 0 or 1 (greedy)</li>
<li><code>??</code>    : 0 or 1 (lazy) REVIEW THIS!!!</li>
<li><code>{2}</code>: exactly 2 of the preceding token</li>
<li><code>{2,}</code>      : 2 or more of the preceding token (greedy, will grab as many as it can)</li>
<li><code>{2,}?</code>    : 2 or more of the preceding token (lazy, will settle for 2 if it can)</li>
<li><code>{2,4}</code>    : no less than 2, and no more than 4 (greedy, will try 4, 3, and then 2)</li>
<li><code>{2,4}?</code>    : no less than 2, and no more than 4 (lazy, will take 2 even if 3, 4 possible)</li>
</ol>

<blockquote><p>In general, greedy quantifiers (lacking <code>?</code> at the end) will go for maximum number of characters satisfying their criteria.  Lazy quantifiers (with <code>?</code> at the end) will settle for the fewest allowable.
</p></blockquote>

<h4>Groups</h4>
<ol>
<li><code>(foo)</code>: define a group (or subpattern) consisting of pattern foo, to be referenced using a backreference in a replacement.</li>
<li><code>(foo|bar)</code>: match patter foo or bar</li>
<li><code>(?&lt;foo&gt;bar)</code>: Define a group (or subpattern) named <code>foo</code> consisting of pattern bar, to be referenced using a backreference in a replacement by the name $foo.</li>
<li><code>(?:foo)</code>: define a passive group consisting of patter foo, that cannot be backreferenced.</li>
<li><code>(?&gt;foo+)bar</code>: define an atomic group consisting of pattern foo+. Once foo+ has been matched, the regex engine will not try to find other variable length matches of foo+ in order to find a match followed by a match of bar. Atomic groups may be used for perforamce reasons.
</ol>
<p>Note that in the above, <code>(foo)</code> is usually called a <strong>Capturing Group</strong>, while <code>(?:foo)</code> is called a <strong>Non-capturing Group</strong>.</p>

<h4>Assertions</h4>
<ol>
<li><code>foo(?=bar)</code> : lookahead assertion, match <code>foo</code> only if followed by <code>bar</code>
<li><code>foo(?!bar)</code>   : negative lookahead, match <code>foo</code> only if <em>not</em> followed by <code>bar</code>
<li><code>(?<=foo)bar</code>   : lookbehind assertion, match <code>foo</code> only if preceded by <code>bar</code>
<li><code>(?&lt;!foo)bar</code>   : negative lookbehind, match <code>foo</code> only if not preceded by <code>bar</code>
</ol>
<blockquote><p>Lookbehinds are NOT supported in Javascript!</p></blockquote>

<h4>Back References</h4>
<p>Back references are used to refer back to a previous capture group and/or parts of the string preceding or following a match.</p>
<ol>
<li><code>$n</code> : string matched in the n<sup>th</sup> capture group</li>
<li><code>$0</code>, or <code>$&#038;</code> : entire matched string</li>
<li><code>$foo</code> : matched string within the <code>foo</code> capture</li>
<li><code>$`</code>   : portion of string that precedes the match</li>
<li><code>$'</code>   : portion of string that follows the match</li>
</ol>

<h4>Case Modifiers</h4>
<h4>Modifers</h4>
<h3>Flags</h3>
<p>The flags can be any combination of the following:</p>
<ul>
<li>global (/g): finds all items that match the RE in the entire selection.  Without this, only the first occurrence will be matched.</li>
<li>ignoreCase (/i): ignores case when checking for match, i.e. 'HellO', and 'hELLo' will be considered equivalent</li>
<li>multiline(/m): Treat beginning and end characters (^ and $) as working over multiple lines (i.e., match the beginning or end of each line (delimited by \n or \r), not only the very beginning or end of the whole input string).</li>
<li>sticky(/y): matches only from the index indicated by the lastIndex property of this regular expression in the target string (and does not attempt to match from any later indexes). This allows the match-only-at-start capabilities of the character "^" to effectively be used at any location in a string by changing the value of the lastIndex property.
</li>
</ul>
<h3>Summary Table</h3>
<table>
<tr>
<th>Expression</th>
<th>Definition</th>
<th>Examples</th>
</tr>
<tr>
<td>.</td>
<td>1 or more of any character</td>
<td>.:: a,1,?,'sp' ab.::abc, not ab</td>
</tr>
<tr>
<td>?</td>
<td>0 or 1 of previous <strong>char</strong></td>
<td>ab? :: a,aa,aaab,ab, not abb</td>
</tr>
<tr>
<td>*</td>
<td>0 or more of previous <strong>char</strong></td>
<td>ba+ ::b,ba,baaa,bba</td>
</tr>
<tr>
<td>+</td>
<td>1 or more of previous <strong>char</strong></td>
<td>a+::a,aa,aaa/ab+ :: abb, not abab</td>
</tr>
<tr>
<td>^ / $</td>
<td>Beginning/End of string</strong></td>
<td>--</td>
</tr>
<tr>
<td>|</td>
<td>Matches expression to its left or right</td>
<td>ab|cd::ab,cd, a(b|c)d::abd,acd</td>
</tr>
<tr>
<td>{n}</td>
<td>Matches n occurrences of previous token</td>
<td>(ab){2}::abab, not abcab</td>
</tr>
<tr>
<td>{m,n}</td>
<td>Matches min(m) to n occurrences of previous token</td>
<td>(ab){2,4}::abab,ababab,abababab</td>
</tr>
<tr>
<td>\w,(\W)</td>
<td>Alphanumeric and _</td>
<td>\w::a-z,A-Z,0-9,_ not %,?,'sp'</td>
</tr>
<tr>
<td>\d, (\D)</td>
<td>Digit characters</td>
<td>\d::0-9 not a,'sp',?</td>
</tr>
<tr>
<td>\s, (\S)</td>
<td>Whitespace character</td>
<td>\s::'sp',tab not a,?,/,@</td>
</tr>
<tr>
<td>\b, (\B)</td>
<td>Word Boundary</td>
<td>\b::'sp',tab,^,$,?,. not x,a,A,3</td>
</tr>
<tr>
<td>\n</td>
<td>Newline Character</td>
<td>newline</td>
</tr>
<tr>
<td>[ ]</td>
<td>Match a single character in set</td>
<td>[abcAK?]::a,A,?,K not b,D,4</td>
</tr>
<tr>
<td>[^ ]</td>
<td>Match a single character NOT in set</td>
<td>[^abcAK?]::b,D,4, not a,A,?,K</td>
</tr>
</table>
<h3>More Reading</h3>
<ol class="aftertuts-references">
<li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions" target="_blank">Mozilla Developer Network, Regular Expressions</a></li>
</ol>
          