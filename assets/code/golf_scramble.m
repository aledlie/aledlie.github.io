%
% How many of me does it take to shoot par in a scramble?
% Septmber 7th, 2015.

   % Set some parameters about me.
   max_p = 250.0;
   std_p = 0.3713;
   std_p = 0.2723;

   % Number of trials.
   Ntrials = 50;

   % Cup size.
   cup_size = 0.118;

   % Set up a round of golf.
   holes = [ ones( 4, 1 ) * 550; ones( 4, 1 ) * 150; ones( 10, 1 ) * 350 ];

   % Number of golfers in the "scramble".
   scramble = 2;

   % Initialize the score to 0.
   score = 0 * holes;

   % Create a meshgrid of data points to study.
   skill          = linspace( 0.01, 0.5, 50 );
   drive_distance = linspace( 100.0, 350.0, 50 );
   players        = [ 1 2 3 4 ];

   % Setup an array to store the score.
   score_surface = zeros( length(drive_distance), length(skill), length(players) );

   % Loop over each drive distance.
   for iidrive_distance = 1:length(drive_distance)

      % Loop over skill.
      for iiskill = 1:length(skill)

         % Loop over players.
         for iiplayers = 1:length(players)

            p( iidrive_distance * iiskill * iiplayers, length(drive_distance) * length(skill) * length(players) );

            % Set the current player parameters.
            std_p = skill(iiskill);
            max_p = drive_distance( iidrive_distance );
            scramble = players( iiplayers );

            % Loop over trials.
            for iitrial = 1:Ntrials

               % Play the scramble.
               for ii = 1:length(holes)

                  % Set the current distance.
                  iidistance = holes(ii);
                  strokes    = 0;

                  % Play this shot.
                  while abs(iidistance) > cup_size
                     if iidistance > max_p
                        iidistance_next = iidistance -      max_p * ( 1.0 + std_p * randn(scramble, 1) );
                     else
                        iidistance_next = iidistance - iidistance * ( 1.0 + std_p * randn( scramble, 1 ) );
                     end

                     % Take the best shot and add a stroke.
                     [junk ndx] = min( abs( iidistance_next ) );
                     iidistance = iidistance_next( ndx );
                     strokes    = strokes + 1;
                  end

                  % Keep track of the score.
                  score(ii) = strokes;

               end

               score_surface( iidrive_distance, iiskill, iiplayers ) = score_surface( iidrive_distance, iiskill, iiplayers ) + sum( score ) / Ntrials;

            end
          end
      end
   end

   % Make panel plot.
   figure;
   ax(1) = subplot(2,2,1);
   contourf( skill, drive_distance, score_surface(:, :, 1 ) );
   hold on;
   [junk h ] = contour( skill, drive_distance, score_surface(:,:,1), [72.0 72.0] );
   set( h, 'linecolor', [1 0 1] , 'linewidth', 2.0 );
   ylabel( 'Mean Drive Distance' );
   title( 'One Player Scramble' );
   set( gca, 'xtick', [0.1000    0.2000    0.3000    0.4000    0.5000] );
   colorbar;

   ax(2) = subplot(2,2,2);
   contourf( skill, drive_distance, score_surface(:, :, 2 ) );
   hold on;
   [junk h ] = contour( skill, drive_distance, score_surface(:,:,2), [72.0 72.0] );
   set( h, 'linecolor', [1 0 1] , 'linewidth', 2.0 );
   title( 'Two Player Scramble' );
   set( gca, 'xtick', [0.1000    0.2000    0.3000    0.4000    0.5000] );
   colorbar;

   ax(3) = subplot(2,2,3);
   contourf( skill, drive_distance, score_surface(:, :, 3 ) );
   hold on;
   [junk h ] = contour( skill, drive_distance, score_surface(:,:,3), [72.0 72.0] );
   set( h, 'linecolor', [1 0 1], 'linewidth', 2.0 );
   title( 'Three Player Scramble' );
   ylabel( 'Mean Drive Distance' );
   xlabel( '\alpha' );
   set( gca, 'xtick', [0.1000    0.2000    0.3000    0.4000    0.5000] );
   colorbar;

   ax(4) = subplot(2,2,4);
   contourf( skill, drive_distance, score_surface(:, :, 4 ) );
   hold on;
   [junk h ] = contour( skill, drive_distance, score_surface(:,:,4), [72.0 72.0] );
   set( h, 'linecolor', [1 0 1], 'linewidth', 2.0 );
   title( 'Four Player Scramble' );
   xlabel( '\alpha' );
   set( gca, 'xtick', [0.1000    0.2000    0.3000    0.4000    0.5000] );
   colorbar;

   c = caxis;
   %set( ax, 'clim', c );
   set( gcf,'pos', [290   139   786   590] );
