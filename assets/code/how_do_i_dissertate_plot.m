% Loop over the dates loating data.
fid = fopen( 'dates.txt' );
for ii = 1:43
   iiline = strtrim( fgetl(fid) );
   this_date_str = [ iiline(9:10) '-' iiline(5:7) '-2016 ' iiline(12:end) ];
   date_num(ii) = datenum(this_date_str);
end
fclose( fid );
date_num = flipud(date_num');
date_num = date_num - date_num(1);

% Load the data representing the length of my dissertation.
words = importdata( 'word_length.txt' );

% Make a plot.
figure;
plot( date_num, words, 'b--.' );
xlabel( 'Number of Days Since I Created dissertation.tex' );
ylabel( 'Number of Words in dissertation.tex' );
fixfig_pres;
