---
title: Using Bash
date: Mon Aug 18, 2014 8:15AM
tag: bash
---
<code>bash</code> is at the heart of every Linux and MacOs command line.  Simply put, to make full use of the command line, you need to know how to program it.  Bash is much too big to be fully described in an article of this scope, so this article summarizes the basic uses, and gives plenty of references to study further.  

<h2>Using Bash</h2>

<h3>Environment Variables</h3>
Environment variables are ASCII strings stored internally by the bash shell.  They are available not only to the shell itself, but other shells spawned from it.  For this to work, you need to export the variable as follows:

{% highlight bash  %}    
SOMEVAR="A Value"
export $SOMEVAR
{% endhighlight %}

Now, <code>SOMEVAR</code> will have the value of "A Value" in every shell spawned from this shell, and any C language program through <code>getenv('SOMEVAR')</code>

In cases where there may be some ambiguity as to how to parse a variable, then double quotes <code>""</code> or curly braces <code>{}</code> should be used to clearly separate the variable from the surrounding text.
{% highlight bash  %}    
SOMEVAR="Hello "
# this will confuse the shell, and nothing will print
echo $SOEMVARJohnny
# these will not, both print "Hello Johnny"
echo ${SOMEVAR}Johnny
echo "$SOMEVAR"Johnny
{% endhighlight %}    

<h3>Passing Arguments</h3>
An important feature of bash scripting is the ability to pass arguments to a script from the environment invoking it.  Arguments are denoted by <code>$n</code>, where n is either an integer or the special characters <code>$</code> or <code>@</code>.

<pre>
$0   : name of the script
$1   : 1st argument
$2   : 2nd argument
${10}: 10th argument
$@   : all arguments, space separated, excludes $0
$#   : number of command line arguments, excludes $0
</pre>

<h3>Error Handling</h3>
The <a href="http://tldp.org/LDP/abs/html/exit-status.html" target="_blank"><code>exit</code> command</a> can be used to not only quit a script when an error occurs, but also to pass a value to the parent process for further processing and error handling.

A return value of <code>0</code> indicates successful completion while a non-zero value indicates an error.

If the <code>exit</code> command is executed without any arguments, then the returned value of the last command will be returned to the parent process.

<h3>Command Substitution</h3>
Use the double back-quotes <code>``</code> (above the <em>TAB</em> key) or parentheses <code>()</code> to obtain and store the result of an executable command into an environment variable.

{% highlight bash  %}    
MYPWDFILE=`basename ~/private/pswd.txt`
MYPWDDIR=`dirname ~/private/pswd.txt`
# "Password file pswd.txt is in directory     /Users/developer/private"
echo "Password file $MYPWDFILE is in directory $MYPWDDIR"
# the following will do the exact same thing
MYPWDFILE=$(basename ~/private/pswd.txt)
MYPWDDIR=$(dirname ~/private/pswd.txt)
{% endhighlight %}    

<h3>String Splitting</h3>
Assuming <code>MYVAR</code> is set to a string, then the general expression
 <code>${MYVARx[x][*]s}</code>, where 
<code>[]</code> indicates an optional item, and x=# or % will select part of the string according to the following rules:

<ul>
<li># indicates the search is from the <strong>left</strong> to the <strong>first</strong> available match</li>
<li>% indicates the search is from the <strong>right</strong> to the <strong>first</strong> available match</li>
<li>## and %% indicate going to the <strong>last</strong> available match</li>
<li>* indicates a <strong>wild-characters</strong></li>
</ul>

For example,

${MYVAR#f}: select up to the first f, and <strong>return the rest of the string</strong>

{% highlight bash  %}    
MYVAR="fffollowff" 
echo ${MYVAR#f} # ffollowff - matches 1st f found
echo ${MYVAR##f} # ffollowff - only 1 f is matched, no wild-character
echo ${MYVAR#*f} # ollowff - matches anything that ends with a single f, including ff
echo ${MYVAR##*f} # blank - matches anything that ends with a single f, including that last f at the end
{% endhighlight %}    

As another example, the fowing will pull out the file extension
<code>${FILENAME##*.}</code>

and this will remove the extension from the filename:
<code>${FILENAME%.*}</code>

Instead of using <code>dirname</code> and <code>basename</code>, we could use these as substitutes

<code>${FILE##*/}</code> for <code>basename</code>
<code>${FILE%/*}</code> for <code>dirname</code>

{% highlight bash  %}    
FILE="/usr/local/bin/file.bin"
echo ${FILE##*.}           # bin
echo ${FILE%.*}            # /usr/local/bin/file
echo ${FILE##*/}           # file.bin
echo ${FILE%/*}            # /usr/local/bin
FILENAME=${FILE##*/}       # file.bin
echo ${FILENAME%.*}        # file
{% endhighlight %}    

<h3>Conditions</h3>
<a href="http://www.tldp.org/LDP/Bash-Beginners-Guide/html/sect_07_01.html" target="_blank">Conditions</a> used in testing to return a Boolean value are somewhat different from constructs used in procedural languages.   They are used by conditional statements as well as looping constructs.

<blockquote>To keep string comparisons safe, always surround string constants and variables by double quotes <code>""</code>.</blockquote>

The following table describes the various conditional tests.

<a href="/assets/img/Screen-Shot-2013-10-04-at-10.25.31-AM.png">
<img src="/assets/img/Screen-Shot-2013-10-04-at-10.25.31-AM.png" alt="Screen Shot 2013-10-04 at 10.25.31 AM" width="954" height="620" class="aligncenter size-full wp-image-219" />
</a>

<blockquote>In conditional tests, the spaces around <code>=</code> matter.  Do not delete them! That is, <code>[ a=b ]</code> is NOT the same thing as <code>[ a = b ]</code>.  The former is treated as a single string, and always returns true while the latter is a logical comparison.</blockquote>

<h3>Conditional Statements</h3>
There are two general forms of  conditionals, namely <code>if/then elif/then fi</code> and <code>case/in esac</code>.

The <code>if</code> statement has the following structure:

{% highlight bash  %}    
if [ condition ]
then
  do something
elif [ condition ]
then
  do something else
else
  last action
fi
{% endhighlight %}    

and the <code>case</code> statement works as follows:

{% highlight bash  %}    
case "value" in
val1) do something
     ;;
val2) do something else
     ;;
  *) default, no match
     exit
     ;;
esac
{% endhighlight %}    

Note the use of <code>;;</code> to indicate a break from the next case.

<h3>Loop Structures</h3>
<h4>for/in</h4>
The general form of the for/in loop is 
{% highlight bash  %}    
for variable in list
do
  statements
done
{% endhighlight %}    

Here, variable is simply a shell variable and list is a list of values over which the for loop will iterate.

{% highlight bash  %}    
for x in one two three four
do
    echo number $x
done
number one
number two
number three
number four
{% endhighlight %}    

<h4>while/do</h4>
<code>while</code> statements run as long as the condition is <code>true</code>.  The structure looks like this:

{% highlight bash  %}    
while [ condition ]
do
  statements
done

while [ $myvar -ne 10 ]
do
  echo $myvar
  myvar=$(( $myvar + 1 ))
done
# counts up from 0 to 10
{% endhighlight %}    


<h4>until/do</h4>
<code>until</code> is a mirror image of <code>while</code>, i.e. runs as long as the condition is <code>false</code>.  It is otherwise identical.

{% highlight bash  %}    
until [ condition ]
do
  statements
done
{% endhighlight %}    

<h3>Functions</h3>
Functions are defined with a syntax of <code>function_name() { }</code>.  Parameters are passed into functions in simliar <code>$</code> notation to the rest of bash.  To define a function in one file and use it in another, simply <code>source</code> the function's source file in the second file.

Variables are by default declared in the global space, even inside function scope.  To keep them local to the function, simply prefix them with <code>local</code>.

{% highlight bash  %}    
#!/usr/bin/env bash
myvar="hello"
myfunc() {
  local x
  local myvar="one two three"
  for x in $myvar
  do
    echo $x   # one, two, three
  done
}
myfunc
echo $myvar $x   # hello - NOT clobbered
{% endhighlight %}    

---
<h3>References</h3>
<ol class="aftertuts-references">
<li><a href="http://www.tldp.org/LDP/Bash-Beginners-Guide/html/" target="_blank">Bash Guide for Beginners</a></li>
<li><a href="http://www.tldp.org/LDP/abs/html/" target="_blank">Advanced Bash Scripting Guide</a></li>
<li><a href="http://www.ibm.com/developerworks/linux/library/l-bash/index.html" target="_blank">Bash by Example</a></li>
</ol>



