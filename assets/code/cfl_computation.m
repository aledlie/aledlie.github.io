%
%
% Playground script to check CFL number computation method. - 8/10/2015.

   % Add to path.
   addpath(genpath(cd));

   % Load the Dongsha case.
   data = smpm_read_initfile( [ pwd '/examples/dongsha_init.h5'] );

   % Unpack.
   x = data.grid.x;
   z = data.grid.z;
   ux = data.ic.ux;
   uz = data.ic.uz;
   n = data.grid.n;
   mx = data.grid.mx;
   mz = data.grid.mz;


   % Build the SMPM differentiation matrices.

      % Compute the GLL gridpoints.
      [eta, w, junk] = lglnodes( n - 1 );
      eta            = flipud( eta )';

      % Compute the spectral differentiation matrix of order 1.
      D1 = zeros( n, n );
      for ii = 1:n
          D1(:, ii) = make_lagrange( eta, eta, ii, 1 );
      end
      eta = eta';

   %  Build the derivative matrices (sparsely) in eta and xi.
   Dxi  = kron( speye( n * mx * mz ), D1 );
   Deta = kron( speye( mx ), kron( D1, speye( n * mz ) ) );

   % Compute some metric terms we'll need.
   x_eta = reshape( Deta * x(:), n * mz, n * mx );
   z_eta = reshape( Deta * z(:), n * mz, n * mx );
   x_xi  = reshape( Dxi * x(:), n * mz, n * mx );
   z_xi  = reshape( Dxi * z(:), n * mz, n * mx );

   % Build the delta-eta term.
   delta_xi = 0 * eta;
   delta_xi(1) = eta(2) - eta(1);
   for ii = 2:n-1
      delta_xi(ii) = eta(ii+1) - eta(ii-1);
   end
   delta_xi(end) = eta(end) - eta(end-1);

   % Expand onto the whole grid.
   DXI  = reshape( kron( ones( n * mx * mz, 1 ), delta_xi ), n * mz, n * mx );
   DETA = reshape( kron( ones( mx, 1 ), kron( delta_xi, ones( n * mz, 1 ) ) ), n * mz, n * mx );

   % Compute the local grid deformations.
   DX = x_eta .* DETA + x_xi .* DXI;
   DZ = z_eta .* DETA + z_xi .* DXI;

   % Compute the local maximum time-step.
   dtx = DX ./ ux;
   dtz = DZ ./ uz;

   % Compute the maximum time-step.
   dt_max   = min(min(abs(dtx(:))), min(abs(dtz(:))));
   u = hypot( ux, uz );
   dt_max_2 = min( min( abs( DX(:) ) ), min( abs( DZ(:) ) ) ) / max( abs( u(:) ) );

   % Make some graphics.

      % Figure 0. Graphic of the initial condition.
      figure;
      contourf( x/1000, z, u );
      ax = gca;
      smpm_visualize_mesh( n, mx, mz, x/1000, z, gcf );
      cb = colorbar;
      xlabel('kilometers');
      ylabel('meters');
      set( gcf, 'pos', [28         386        1135         246] );
      axes( cb );
      ylabel( 'velocity in meters/second' );
      fixfig_pres;
      print_graphics( gcf, 'cfl_velocity', 0, 1, 0, 0 );
      set( ax, 'xlim', [0, 10.0] );
      fixfig_pres;
      print_graphics( gcf, 'cfl_velocity_zoom', 0, 1, 0, 0 );

      % Figure 1. Maximum time-step graphic.
      figure;
      contourf( x/1000, z, min( abs(dtx), abs(dtz) ), linspace( 0.0, 500, 25 ) );
      smpm_visualize_mesh( n, mx, mz, x/1000, z, gcf );
      ax = gca;
      cb = colorbar;
      set( gcf, 'pos', [28         386        1135         246] );
      xlabel('kilometers');
      ylabel('meters');
      axes( cb );
      ylabel( 'time-step in seconds' );
      fixfig_pres;
      print_graphics( gcf, 'cfl_timestep', 0, 1, 0, 0 );
      set( ax, 'xlim', [0 10] );
      fixfig_pres;
      print_graphics( gcf, 'cfl_timestep_zoom', 0, 1, 0, 0 );

      % Figure 2. Mesh.
      figure;
      smpm_visualize_mesh( n, mx, mz, x/1000, z );
      set( gcf, 'pos', [28         386        1135         246] );
      xlabel('kilometers');
      ylabel('meters');
      fixfig_pres;
      set(gca, 'ylim', [min(z(:)), 0], 'xlim', [0, max(x(:)/1000)] );
      print_graphics( gcf, 'cfl_mesh', 0, 1, 0, 0 );

      % Figure 3. Local deformations dx and dz.
      figure;
      contourf( x/1000, z, DZ );
      smpm_visualize_mesh( n, mx, mz, x/1000, z, gcf );
      set( gcf, 'pos', [28         386        1135         246] );
      xlabel('kilometers');
      ylabel('meters');
      fixfig_pres;
      print_graphics( gcf, 'cfl_dz', 0, 1, 0, 0 );

      figure;
      contourf( x/1000, z, DX );
      smpm_visualize_mesh( n, mx, mz, x/1000, z, gcf );
      set( gcf, 'pos', [28         386        1135         246] );
      xlabel('kilometers');
      ylabel('meters');
      fixfig_pres;
      print_graphics( gcf, 'cfl_dx', 0, 1, 0, 0 );

