%
% How hard is running hills?  Computation and plots for the blog post.
% July 26th, 2015.

% Add my local MATLAB tools to my path.
addpath(genpath('/Users/joshi/Dropbox/matlab'));

% Figure 0: Make a plot of the counter/clockwise loop.
x = linspace( 0, 2.5, 100 );
s = x;
m = 30; % Peak height of the hill.
s( x <= 2.0 ) =  m / 2;
s( x >  2.0 ) = -m / 0.5;
z = cumtrapz( x, s );
plot( x, z );
hold on;
plot( x, fliplr( z ), 'r' );

   % Make a plot.
   set(gcf,'position',[106         296        1065         390]);
   ylabel( 'Elevation' );
   legend( 'Clockwise', 'Counterclockwise', 'Location', 'NorthOutside' );
   set(gca,'xtick',[0,2.5],'xticklabel',{'Start','Finish'});
   set(gca,'ytick',[]);

   % Add labels for the steep and shallow slopes.
   text( 0.75, 10, 'shallow (m = s)', 'color', 'b' );
   text( 2.15, 25, 'steep (m = -t)', 'color', 'b' );
   text( 0.35, 20, 'steep (m = t )', 'color', 'r' );
   text( 1.5, 17, 'shallow (m = -s)','color', 'r' );

   fixfig_pres;

   % Print the picture and move it to the ../images directory.
   print_graphics( gcf, 'running_hills', 0, 1, 0, 0 );
   !mv running_hills.png ../../images
