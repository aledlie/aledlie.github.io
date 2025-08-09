% Playing a hole of golf as a sequence of Gaussian random variables.
%
%  Monday, September 9th, 2015.

   % Set some player parameters.  All distances in yards.
   max_p = 250.0;  % Mean maximum distance.
   std_p = 0.2;   % Standard deviation.

   % Set some hole parameters.
   d = 450;

   % Set the cup width.
   c = 0.118;

   % Set up a round of golf.
   holes = [ ones( 4, 1 ) * 550; ones( 4, 1 ) * 150; ones( 10, 1 ) * 350 ];

   % Play a motherfucking round of golf.
   for ii = 1:length(holes)
      round{ii} = simulate_hole( holes(ii), max_p, std_p );
      score(ii) = length(round{ii});
   end

   % Over a bunch of different values of the standard deviation play a few rounds of golf.
   skill          = linspace( 0.01, 0.5, 100 );
   drive_distance = linspace( 100.0, 350.0, 100 );
   score_mean = 0 * skill;
   score_std  = 0 * skill;
   trials     = 100;
   count      = 1;
   for iimax = 1:length(drive_distance)
      for iistd = 1:length(skill)

         % Simulate a bunch of rounds of golf.
         score = zeros( trials, 1 );
         for iitrial = 1:trials

            % Simulate a round of golf.
            iiscore = 0;
            for ii = 1:length(holes)
               iihole = simulate_hole( holes(ii), drive_distance(iimax), skill(iistd) );
               iiscore = iiscore + length(iihole) - 1; % -1 because the tee shot distance isn't a stroke.
            end
            score( iitrial ) = iiscore;
         end

         % Store this golfer's information.
         score_mean(iimax,iistd) = mean( score );
         score_std(iimax,iistd)  = std( score );

         % Display some information.
         fprintf( [ 'Trial ' num2str( count ) ' out of ' num2str( length(skill)*length(drive_distance) ) ' complete. \n' ] );
         count = count + 1;

      end
   end

   % Generate a plot.
   plot(skill,score_mean);
   hold on;
   plot(skill,score_mean + score_std,'k--');
   plot(skill,score_mean - score_std,'k--');
   xlabel('\alpha');
   ylabel('Score');

